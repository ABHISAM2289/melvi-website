"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const bcrypt = require("bcryptjs");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor() {
        this.logger = new common_1.Logger(DatabaseService_1.name);
        this.isConnected = false;
        const connectionString = process.env.DATABASE_URL;
        if (process.env.NODE_ENV === 'production' && !connectionString) {
            throw new Error('DATABASE_URL must be configured in production.');
        }
        this.pool = new pg_1.Pool(connectionString
            ? {
                connectionString,
                ssl: process.env.DB_SSL === 'true' ? true : undefined,
                max: 10,
                idleTimeoutMillis: 30000,
            }
            : {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5434', 10),
                user: process.env.DB_USER || 'melvi_user',
                password: process.env.DB_PASSWORD || 'melvipassword123',
                database: process.env.DB_NAME || 'melvi_db',
                max: 10,
                idleTimeoutMillis: 30000,
            });
    }
    async onModuleInit() {
        try {
            const client = await this.pool.connect();
            this.isConnected = true;
            this.logger.log(' Connected to PostgreSQL Docker container (melvi_db)');
            client.release();
            await this.initSchema();
            await this.seedInitialData();
        }
        catch (err) {
            this.isConnected = false;
            this.logger.error(`PostgreSQL connection failed: ${err.message}`);
            if (process.env.NODE_ENV === 'production') {
                throw err;
            }
            this.logger.warn('Continuing with in-memory storage for local development.');
        }
    }
    async onModuleDestroy() {
        await this.pool.end();
    }
    async query(text, params) {
        if (!this.isConnected) {
            return { rows: [] };
        }
        return this.pool.query(text, params);
    }
    async initSchema() {
        if (!this.isConnected)
            return;
        await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(64) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(32) NOT NULL DEFAULT 'customer',
        phone VARCHAR(64),
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(64);

      CREATE TABLE IF NOT EXISTS catalog_products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        tagline VARCHAR(255),
        price NUMERIC(10,2) NOT NULL,
        original_price NUMERIC(10,2),
        rating NUMERIC(3,1) DEFAULT 4.9,
        reviews_count INT DEFAULT 42,
        category VARCHAR(64) NOT NULL,
        image TEXT NOT NULL,
        description TEXT NOT NULL,
        badge VARCHAR(64),
        cocoa_percentage INT,
        tags TEXT[],
        is_featured BOOLEAN DEFAULT false,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE catalog_products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

      CREATE TABLE IF NOT EXISTS promo_banners (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        highlight VARCHAR(255),
        subtitle TEXT,
        cta_text VARCHAR(64),
        code VARCHAR(32),
        bg_gradient VARCHAR(128),
        image TEXT,
        link_type VARCHAR(64),
        is_active BOOLEAN DEFAULT true
      );
      ALTER TABLE promo_banners ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE promo_banners ADD COLUMN IF NOT EXISTS link_type VARCHAR(64);

      -- Ensure existing banners have valid high-contrast gradients and images
      UPDATE promo_banners 
      SET bg_gradient = 'from-amber-500 to-amber-600', 
          image = COALESCE(NULLIF(image, ''), '/images/melvi-founder-box.jpg'),
          link_type = COALESCE(NULLIF(link_type, ''), 'custom_box')
      WHERE id = 'banner-1' AND (image IS NULL OR image = '' OR bg_gradient LIKE '%900%');

      UPDATE promo_banners 
      SET bg_gradient = 'from-rose-900 to-amber-950', 
          image = COALESCE(NULLIF(image, ''), '/images/melvi-bonbons.jpg'),
          link_type = COALESCE(NULLIF(link_type, ''), 'store')
      WHERE id = 'banner-2' AND (image IS NULL OR image = '' OR bg_gradient LIKE '%cocoa%');

      UPDATE promo_banners 
      SET bg_gradient = 'from-cyan-900 to-blue-950',
          link_type = COALESCE(NULLIF(link_type, ''), 'tracking')
      WHERE id = 'banner-3' AND (bg_gradient LIKE '%velvet%' OR bg_gradient IS NULL OR bg_gradient = '');

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        tracking_number VARCHAR(64) UNIQUE NOT NULL,
        user_id VARCHAR(64),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(64),
        shipping_address TEXT NOT NULL,
        city VARCHAR(128),
        pincode VARCHAR(32),
        items_json JSONB NOT NULL,
        custom_box_specs JSONB,
        custom_notes TEXT,
        gift_message TEXT,
        total_amount NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(64) NOT NULL,
        payment_status VARCHAR(64) NOT NULL DEFAULT 'PAID',
        order_status VARCHAR(64) NOT NULL DEFAULT 'ARTISAN_CRAFTING',
        courier_name VARCHAR(128) DEFAULT 'Melvi Cold-Chain Express',
        estimated_delivery VARCHAR(64),
        current_checkpoint VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tracking_events (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(128),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_addresses (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        label VARCHAR(64) DEFAULT 'Home',
        recipient_name VARCHAR(255),
        phone VARCHAR(64),
        address_line TEXT NOT NULL,
        city VARCHAR(128) NOT NULL,
        state VARCHAR(128) DEFAULT 'Maharashtra',
        pincode VARCHAR(32) NOT NULL,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS promo_coupons (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(32) UNIQUE NOT NULL,
        discount_type VARCHAR(32) NOT NULL DEFAULT 'PERCENTAGE',
        discount_value NUMERIC(10,2) NOT NULL,
        min_order_amount NUMERIC(10,2) DEFAULT 0,
        max_discount_amount NUMERIC(10,2) DEFAULT 0,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        usage_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        this.logger.log(' Verified/Created Melvi database tables');
    }
    async seedInitialData() {
        if (!this.isConnected)
            return;
        const products = [
            {
                id: 'prod-melvi-01',
                name: 'Signature Bonbon Box',
                tagline: 'A jeweled selection of handcrafted ganaches',
                price: 1299,
                originalPrice: 1599,
                rating: 4.9,
                reviewsCount: 124,
                category: 'chocolate-bites',
                image: '/images/chocolates/choco-1.jpg',
                description: 'A curated box of handcrafted chocolate bonbons.',
                badge: 'Bestseller',
                cocoaPercentage: 70,
                tags: ['Handcrafted', 'Gift'],
                isFeatured: true,
            },
            {
                id: 'prod-melvi-02',
                name: 'Hazelnut Praline Bar',
                tagline: 'Silky praline wrapped in rich dark chocolate',
                price: 499,
                originalPrice: 599,
                rating: 4.8,
                reviewsCount: 86,
                category: 'chocolate-bars',
                image: '/images/chocolates/choco-2.jpg',
                description: 'A crisp, buttery hazelnut praline chocolate bar.',
                badge: 'Customer Favorite',
                cocoaPercentage: 65,
                tags: ['Hazelnut', 'Dark chocolate'],
                isFeatured: true,
            },
            {
                id: 'prod-melvi-03',
                name: 'Cocoa Truffle Selection',
                tagline: 'Velvety truffles finished by hand',
                price: 899,
                originalPrice: null,
                rating: 4.9,
                reviewsCount: 73,
                category: 'surprise',
                image: '/images/chocolates/choco-3.jpg',
                description: 'An assortment of smooth cocoa-dusted chocolate truffles.',
                badge: 'Artisan Made',
                cocoaPercentage: 72,
                tags: ['Truffles', 'Gift'],
                isFeatured: true,
            },
            {
                id: 'prod-melvi-04',
                name: 'Pistachio Velvet Bar',
                tagline: 'Roasted pistachio with a delicate cocoa finish',
                price: 549,
                originalPrice: null,
                rating: 4.8,
                reviewsCount: 51,
                category: 'chocolate-bars',
                image: '/images/chocolates/choco-4.jpg',
                description: 'A rich chocolate bar with roasted pistachio pieces.',
                badge: 'Limited Batch',
                cocoaPercentage: 60,
                tags: ['Pistachio', 'Limited'],
                isFeatured: true,
            },
            {
                id: 'prod-melvi-05',
                name: 'Seasonal Praline Collection',
                tagline: 'A limited-edition assortment for the season',
                price: 1499,
                originalPrice: null,
                rating: 5,
                reviewsCount: 39,
                category: 'limited-editions',
                image: '/images/chocolates/choco-5.jpg',
                description: 'A seasonal selection of small-batch pralines.',
                badge: 'Limited Edition',
                cocoaPercentage: 68,
                tags: ['Seasonal', 'Small batch'],
                isFeatured: true,
            },
        ];
        for (const product of products) {
            await this.pool.query(`INSERT INTO catalog_products (
          id, name, tagline, price, original_price, rating, reviews_count, category,
          image, description, badge, cocoa_percentage, tags, is_featured, in_stock
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,true)
        ON CONFLICT (id) DO NOTHING`, [
                product.id,
                product.name,
                product.tagline,
                product.price,
                product.originalPrice,
                product.rating,
                product.reviewsCount,
                product.category,
                product.image,
                product.description,
                product.badge,
                product.cocoaPercentage,
                product.tags,
                product.isFeatured,
            ]);
        }
        const banners = [
            {
                id: 'banner-1',
                title: 'Build a Box to Remember',
                highlight: 'Personalized gifting',
                subtitle: 'Choose your chocolates and add a thoughtful note.',
                ctaText: 'Create Your Box',
                code: 'CUSTOM',
                bgGradient: 'from-amber-500 to-amber-600',
                image: '/images/poster-custom-box.svg',
                linkType: 'custom_box',
            },
            {
                id: 'banner-2',
                title: 'A Little Luxury, Delivered',
                highlight: 'Made for sharing',
                subtitle: 'Discover handcrafted chocolates for every occasion.',
                ctaText: 'Explore Collection',
                code: 'MELVI',
                bgGradient: 'from-rose-900 to-amber-950',
                image: '/images/poster-royal-discount.svg',
                linkType: 'store',
            },
            {
                id: 'banner-3',
                title: 'Thoughtful from Atelier to Door',
                highlight: 'Carefully packed',
                subtitle: 'Follow your order from our atelier to your door.',
                ctaText: 'Track Order',
                code: 'COLDPACK',
                bgGradient: 'from-cyan-900 to-blue-950',
                image: '/images/poster-cold-chain.svg',
                linkType: 'tracking',
            },
        ];
        for (const banner of banners) {
            await this.pool.query(`INSERT INTO promo_banners (
          id, title, highlight, subtitle, cta_text, code, bg_gradient, image, link_type, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
        ON CONFLICT (id) DO NOTHING`, [
                banner.id,
                banner.title,
                banner.highlight,
                banner.subtitle,
                banner.ctaText,
                banner.code,
                banner.bgGradient,
                banner.image,
                banner.linkType,
            ]);
        }
        const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password || password.length < 16) {
            await this.pool.query(`UPDATE users SET role = 'customer' WHERE role = 'admin'`);
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters in production.');
            }
            this.logger.warn('No admin account provisioned; set ADMIN_EMAIL and a 16+ character ADMIN_PASSWORD.');
            return;
        }
        const username = (process.env.ADMIN_USERNAME || 'admin')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '');
        if (username.length < 3) {
            throw new Error('ADMIN_USERNAME must contain at least 3 letters, numbers, or underscores.');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        await this.pool.query(`UPDATE users SET role = 'customer' WHERE role = 'admin' AND LOWER(email) <> $1`, [email]);
        await this.pool.query(`INSERT INTO users (id, name, username, email, password, role, phone, avatar)
       VALUES ($1, 'Melvi Platform Administrator', $2, $3, $4, 'admin', '', '/images/melvi-official-logo.png')
       ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username, password = EXCLUDED.password, role = 'admin'`, [`usr-admin-${Buffer.from(email).toString('hex')}`, username, email, passwordHash]);
        this.logger.log('Provisioned the configured platform administrator.');
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseService);
//# sourceMappingURL=database.service.js.map