import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public pool: Pool;
  public isConnected: boolean = false;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const cloudSqlSocket = process.env.INSTANCE_CONNECTION_NAME
      ? `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`
      : undefined;
    const dbHost = process.env.DB_HOST || cloudSqlSocket;

    if (process.env.NODE_ENV === 'production' && !connectionString && !dbHost) {
      throw new Error('DATABASE_URL or DB_HOST/INSTANCE_CONNECTION_NAME must be configured in production.');
    }

    this.pool = new Pool(connectionString
      ? {
          connectionString,
          ssl: process.env.DB_SSL === 'true' ? true : undefined,
          max: 10,
          idleTimeoutMillis: 30000,
        }
      : {
          host: dbHost || 'localhost',
          port: parseInt(process.env.DB_PORT || (cloudSqlSocket ? '5432' : '5434'), 10),
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
    } catch (err) {
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

  async query(text: string, params?: any[]) {
    if (!this.isConnected) {
      return { rows: [] };
    }
    return this.pool.query(text, params);
  }

  private async initSchema() {
    if (!this.isConnected) return;

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

  private async seedInitialData() {
    if (!this.isConnected) return;

    // Remove any previously seeded dummy/demo rows so only real user-created records exist
    await this.pool.query(`
      DELETE FROM catalog_products WHERE id IN ('prod-melvi-01', 'prod-melvi-02', 'prod-melvi-03', 'prod-melvi-04', 'prod-melvi-05');
      DELETE FROM promo_banners WHERE id IN ('banner-1', 'banner-2', 'banner-3');
      DELETE FROM promo_coupons WHERE code IN ('MELVIGOLD', 'COLDPACK', 'ROYAL200');
      DELETE FROM tracking_events WHERE order_id = 'ord-live-demo-1';
      DELETE FROM orders WHERE id = 'ord-live-demo-1' OR tracking_number = 'MLV-8821-E';
      DELETE FROM users WHERE id = 'usr-cust-1' OR email = 'sophia@example.com';
    `);

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || password.length < 16) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters in production.');
      }
      await this.pool.query(
        `UPDATE users SET role = 'customer'
         WHERE id = 'usr-admin-1' AND email = 'admin@melvi.com'`
      );
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
    await this.pool.query(
      `UPDATE users SET role = 'customer' WHERE role = 'admin' AND LOWER(email) <> $1`,
      [email]
    );
    await this.pool.query(
      `INSERT INTO users (id, name, username, email, password, role, phone, avatar)
       VALUES ($1, 'Melvi Platform Administrator', $2, $3, $4, 'admin', '', '/images/melvi-official-logo.png')
       ON CONFLICT (email) DO UPDATE
       SET username = EXCLUDED.username, password = EXCLUDED.password, role = 'admin'`,
      [`usr-admin-${Buffer.from(email).toString('hex')}`, username, email, passwordHash]
    );
    this.logger.log('Provisioned the configured platform administrator.');
  }
}
