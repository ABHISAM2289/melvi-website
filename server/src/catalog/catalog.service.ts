import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  category: string;
  image: string;
  description: string;
  badge?: string;
  cocoaPercentage?: number;
  tags: string[];
  isFeatured?: boolean;
  inStock?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaText?: string;
  code?: string;
  bgGradient: string;
  image?: string;
  linkType?: string;
  isActive: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  description: string;
  isActive: boolean;
  usageCount: number;
  createdAt?: string;
}

@Injectable()
export class CatalogService {
  private fallbackProducts: Product[] = [];
  private fallbackBanners: Banner[] = [];
  private fallbackCoupons: Coupon[] = [];

  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  async getProducts(category?: string): Promise<Product[]> {
    if (this.db.isConnected) {
      try {
        let query = 'SELECT * FROM catalog_products';
        const params: any[] = [];
        if (category && category !== 'all') {
          query += ' WHERE category = $1';
          params.push(category);
        }
        query += ' ORDER BY is_featured DESC, price ASC';
        const res = await this.db.query(query, params);
        return res.rows.map(r => ({
            id: r.id,
            name: r.name,
            tagline: r.tagline,
            price: parseFloat(r.price),
            originalPrice: r.original_price ? parseFloat(r.original_price) : undefined,
            rating: parseFloat(r.rating || 5.0),
            reviewsCount: r.reviews_count || 42,
            category: r.category,
            image: r.image,
            description: r.description || '',
            badge: r.badge,
            cocoaPercentage: r.cocoa_percentage,
            tags: r.tags || [],
            isFeatured: r.is_featured,
            inStock: r.in_stock !== undefined ? r.in_stock : true,
          }));
      } catch (err) {
        console.warn('DB read fallback for products:', err.message);
      }
    }

    if (category && category !== 'all') {
      return this.fallbackProducts.filter(p => p.category === category);
    }
    return this.fallbackProducts;
  }

  async addProduct(data: Partial<Product>): Promise<Product> {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name || 'Untitled Confection',
      tagline: data.tagline || 'Artisanal Handcrafted',
      price: Number(data.price) || 299,
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      rating: 5.0,
      reviewsCount: 1,
      category: data.category || 'chocolate-bites',
      image: data.image || '/images/chocolates/choco-1.jpg',
      description: data.description || 'Artisanal single-origin chocolate prepared in small batches.',
      badge: data.badge || 'New Drop',
      cocoaPercentage: data.cocoaPercentage ? Number(data.cocoaPercentage) : 70,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['Handmade', 'Fresh'],
      isFeatured: data.isFeatured ?? true,
      inStock: data.inStock !== undefined ? Boolean(data.inStock) : true,
    };

    if (this.db.isConnected) {
      try {
        await this.db.query(
          `INSERT INTO catalog_products (
            id, name, tagline, price, original_price, rating, reviews_count,
            category, image, description, badge, cocoa_percentage, tags, is_featured, in_stock
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
          [
            newProduct.id,
            newProduct.name,
            newProduct.tagline,
            newProduct.price,
            newProduct.originalPrice || null,
            newProduct.rating,
            newProduct.reviewsCount,
            newProduct.category,
            newProduct.image,
            newProduct.description,
            newProduct.badge || null,
            newProduct.cocoaPercentage || null,
            newProduct.tags,
            newProduct.isFeatured,
            newProduct.inStock,
          ]
        );
      } catch (err) {
        console.warn('DB insert fallback for addProduct:', err.message);
      }
    }

    this.fallbackProducts.unshift(newProduct);
    return newProduct;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; id: string }> {
    if (this.db.isConnected) {
      try {
        await this.db.query('DELETE FROM catalog_products WHERE id = $1', [id]);
      } catch (err) {
        console.warn('DB delete fallback for deleteProduct:', err.message);
      }
    }

    const idx = this.fallbackProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.fallbackProducts.splice(idx, 1);
    }
    return { success: true, id };
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    if (this.db.isConnected) {
      try {
        await this.db.query(
          `UPDATE catalog_products SET
            name = COALESCE($1, name),
            tagline = COALESCE($2, tagline),
            price = COALESCE($3, price),
            original_price = $4,
            category = COALESCE($5, category),
            image = COALESCE($6, image),
            description = COALESCE($7, description),
            badge = $8,
            cocoa_percentage = $9,
            tags = COALESCE($10, tags),
            is_featured = COALESCE($11, is_featured),
            in_stock = COALESCE($12, in_stock)
           WHERE id = $13`,
          [
            data.name || null,
            data.tagline || null,
            data.price ? Number(data.price) : null,
            data.originalPrice ? Number(data.originalPrice) : null,
            data.category || null,
            data.image || null,
            data.description || null,
            data.badge || null,
            data.cocoaPercentage ? Number(data.cocoaPercentage) : null,
            data.tags || null,
            data.isFeatured !== undefined ? data.isFeatured : null,
            data.inStock !== undefined ? Boolean(data.inStock) : null,
            id,
          ]
        );
      } catch (err) {
        console.warn('DB updateProduct fallback:', err.message);
      }
    }

    const idx = this.fallbackProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.fallbackProducts[idx] = { ...this.fallbackProducts[idx], ...data };
      return this.fallbackProducts[idx];
    }

    const all = await this.getProducts();
    const found = all.find(p => p.id === id);
    if (!found) throw new NotFoundException(`Product ${id} not found`);
    return found;
  }

  async getBanners(all: boolean = false): Promise<Banner[]> {
    if (this.db.isConnected) {
      try {
        const query = all 
          ? 'SELECT * FROM promo_banners ORDER BY id ASC' 
          : 'SELECT * FROM promo_banners WHERE is_active = true ORDER BY id ASC';
        const res = await this.db.query(query);
        return res.rows.map(r => ({
            id: r.id,
            title: r.title,
            highlight: r.highlight,
            subtitle: r.subtitle,
            ctaText: r.cta_text,
            code: r.code,
            bgGradient: r.bg_gradient,
            image: r.image || '',
            linkType: r.link_type || '',
            isActive: r.is_active,
          }));
      } catch (err) {
        console.warn('DB read fallback for banners:', err.message);
      }
    }
    return all ? this.fallbackBanners : this.fallbackBanners.filter(b => b.isActive);
  }

  async addBanner(data: Partial<Banner>): Promise<Banner> {
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      title: data.title || 'Artisan Promotion',
      highlight: data.highlight || 'SPECIAL OFFER',
      subtitle: data.subtitle || 'Handcrafted fresh daily at Melvi Atelier',
      ctaText: data.ctaText || 'Shop Now',
      code: data.code || '',
      bgGradient: data.bgGradient || 'from-amber-500 to-amber-600',
      image: data.image || '',
      linkType: data.linkType || 'store',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    };

    if (this.db.isConnected) {
      try {
        await this.db.query(
          `INSERT INTO promo_banners (
            id, title, highlight, subtitle, cta_text, code, bg_gradient, image, link_type, is_active
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            newBanner.id,
            newBanner.title,
            newBanner.highlight,
            newBanner.subtitle,
            newBanner.ctaText,
            newBanner.code,
            newBanner.bgGradient,
            newBanner.image,
            newBanner.linkType,
            newBanner.isActive,
          ]
        );
      } catch (err) {
        console.warn('DB insert fallback for addBanner:', err.message);
      }
    }

    this.fallbackBanners.unshift(newBanner);
    return newBanner;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    if (this.db.isConnected) {
      try {
        await this.db.query(
          `UPDATE promo_banners SET
            title = COALESCE($1, title),
            highlight = COALESCE($2, highlight),
            subtitle = COALESCE($3, subtitle),
            cta_text = COALESCE($4, cta_text),
            code = COALESCE($5, code),
            bg_gradient = COALESCE($6, bg_gradient),
            image = COALESCE($7, image),
            link_type = COALESCE($8, link_type),
            is_active = COALESCE($9, is_active)
           WHERE id = $10`,
          [
            data.title || null,
            data.highlight || null,
            data.subtitle || null,
            data.ctaText || null,
            data.code !== undefined ? data.code : null,
            data.bgGradient || null,
            data.image !== undefined ? data.image : null,
            data.linkType !== undefined ? data.linkType : null,
            data.isActive !== undefined ? Boolean(data.isActive) : null,
            id,
          ]
        );
      } catch (err) {
        console.warn('DB updateBanner fallback:', err.message);
      }
    }

    const idx = this.fallbackBanners.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.fallbackBanners[idx] = { ...this.fallbackBanners[idx], ...data };
      return this.fallbackBanners[idx];
    }

    const all = await this.getBanners(true);
    const found = all.find(b => b.id === id);
    if (!found) throw new NotFoundException(`Banner ${id} not found`);
    return found;
  }

  async deleteBanner(id: string): Promise<{ success: boolean; id: string }> {
    if (this.db.isConnected) {
      try {
        await this.db.query('DELETE FROM promo_banners WHERE id = $1', [id]);
      } catch (err) {
        console.warn('DB deleteBanner fallback:', err.message);
      }
    }

    const idx = this.fallbackBanners.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.fallbackBanners.splice(idx, 1);
    }
    return { success: true, id };
  }

  // Cloudflare R2 Upload Simulator & Image URL generator
  uploadToR2(fileName: string, mimeType: string, base64Data?: string) {
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-r2.melvi.com';
    const uniqueKey = `chocolates/${Date.now()}-${cleanName}`;
    const publicUrl = `${r2PublicDomain}/${uniqueKey}`;

    return {
      success: true,
      provider: 'Cloudflare R2',
      bucket: process.env.R2_BUCKET_NAME || 'melvi-artisan-assets',
      key: uniqueKey,
      url: publicUrl,
      // If client sent data or local demo, provide fallback preview
      previewUrl: base64Data || publicUrl,
    };
  }

  // --- PROMO CODES & COUPONS ENGINE ---

  async getCoupons(all: boolean = false): Promise<Coupon[]> {
    if (this.db.isConnected) {
      try {
        let query = 'SELECT id, code, discount_type as "discountType", discount_value as "discountValue", min_order_amount as "minOrderAmount", max_discount_amount as "maxDiscountAmount", description, is_active as "isActive", usage_count as "usageCount", created_at as "createdAt" FROM promo_coupons';
        if (!all) {
          query += ' WHERE is_active = true';
        }
        query += ' ORDER BY created_at DESC';
        const res = await this.db.query(query);
        return res.rows.map(r => ({
            ...r,
            discountValue: parseFloat(r.discountValue),
            minOrderAmount: parseFloat(r.minOrderAmount || 0),
            maxDiscountAmount: r.maxDiscountAmount ? parseFloat(r.maxDiscountAmount) : 0,
            usageCount: parseInt(r.usageCount || 0, 10),
            isActive: Boolean(r.isActive),
          }));
      } catch (err) {
        console.warn('DB getCoupons notice:', err.message);
      }
    }

    if (all) return this.fallbackCoupons;
    return this.fallbackCoupons.filter(c => c.isActive !== false);
  }

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    const cleanCode = (data.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) {
      throw new Error('A valid coupon code string is required.');
    }

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: cleanCode,
      discountType: data.discountType === 'FLAT' ? 'FLAT' : 'PERCENTAGE',
      discountValue: parseFloat(String(data.discountValue)) || 10,
      minOrderAmount: parseFloat(String(data.minOrderAmount)) || 0,
      maxDiscountAmount: data.maxDiscountAmount ? parseFloat(String(data.maxDiscountAmount)) : 0,
      description: data.description?.trim() || `${data.discountValue}% off promotional coupon`,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (this.db.isConnected) {
      try {
        await this.db.query(
          `INSERT INTO promo_coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, description, is_active, usage_count)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
           ON CONFLICT (code) DO UPDATE SET
             discount_type = EXCLUDED.discount_type,
             discount_value = EXCLUDED.discount_value,
             min_order_amount = EXCLUDED.min_order_amount,
             max_discount_amount = EXCLUDED.max_discount_amount,
             description = EXCLUDED.description,
             is_active = EXCLUDED.is_active`,
          [
            newCoupon.id,
            newCoupon.code,
            newCoupon.discountType,
            newCoupon.discountValue,
            newCoupon.minOrderAmount,
            newCoupon.maxDiscountAmount,
            newCoupon.description,
            newCoupon.isActive,
            newCoupon.usageCount,
          ]
        );
      } catch (err) {
        console.warn('DB createCoupon notice:', err.message);
      }
    }

    this.fallbackCoupons.unshift(newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    if (this.db.isConnected) {
      try {
        await this.db.query(
          `UPDATE promo_coupons SET
            code = COALESCE(NULLIF($1, ''), code),
            discount_type = COALESCE($2, discount_type),
            discount_value = COALESCE($3, discount_value),
            min_order_amount = COALESCE($4, min_order_amount),
            max_discount_amount = COALESCE($5, max_discount_amount),
            description = COALESCE($6, description),
            is_active = COALESCE($7, is_active)
           WHERE id = $8`,
          [
            data.code ? data.code.trim().toUpperCase() : null,
            data.discountType || null,
            data.discountValue !== undefined ? parseFloat(String(data.discountValue)) : null,
            data.minOrderAmount !== undefined ? parseFloat(String(data.minOrderAmount)) : null,
            data.maxDiscountAmount !== undefined ? parseFloat(String(data.maxDiscountAmount)) : null,
            data.description !== undefined ? data.description : null,
            data.isActive !== undefined ? Boolean(data.isActive) : null,
            id,
          ]
        );
      } catch (err) {
        console.warn('DB updateCoupon notice:', err.message);
      }
    }

    const idx = this.fallbackCoupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.fallbackCoupons[idx] = { ...this.fallbackCoupons[idx], ...data };
      return this.fallbackCoupons[idx];
    }

    const all = await this.getCoupons(true);
    const found = all.find(c => c.id === id);
    if (!found) throw new NotFoundException(`Coupon ${id} not found`);
    return found;
  }

  async deleteCoupon(id: string): Promise<{ success: boolean; id: string }> {
    if (this.db.isConnected) {
      try {
        await this.db.query('DELETE FROM promo_coupons WHERE id = $1', [id]);
      } catch (err) {
        console.warn('DB deleteCoupon notice:', err.message);
      }
    }

    const idx = this.fallbackCoupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.fallbackCoupons.splice(idx, 1);
    }
    return { success: true, id };
  }

  // Validate coupon against subtotal and return discount amount
  async validateCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    discountAmount: number;
    finalTotal: number;
    message: string;
    coupon?: Coupon;
  }> {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, discountAmount: 0, finalTotal: subtotal, message: 'Please enter a coupon code.' };
    }

    const coupons = await this.getCoupons(true);
    const matched = coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!matched) {
      return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Promo code "${cleanCode}" is invalid.` };
    }

    if (!matched.isActive) {
      return { valid: false, discountAmount: 0, finalTotal: subtotal, message: `Promo code "${cleanCode}" is currently inactive.` };
    }

    if (subtotal < (matched.minOrderAmount || 0)) {
      return {
        valid: false,
        discountAmount: 0,
        finalTotal: subtotal,
        message: `Minimum order amount of ₹${matched.minOrderAmount} required for "${cleanCode}".`,
      };
    }

    let discount = 0;
    if (matched.discountType === 'PERCENTAGE') {
      discount = Math.round(subtotal * (matched.discountValue / 100));
      if (matched.maxDiscountAmount && matched.maxDiscountAmount > 0) {
        discount = Math.min(discount, matched.maxDiscountAmount);
      }
    } else {
      discount = Math.min(subtotal, matched.discountValue);
    }

    const finalTotal = Math.max(0, subtotal - discount);

    // Increment usage count in DB
    if (this.db.isConnected) {
      this.db.query('UPDATE promo_coupons SET usage_count = usage_count + 1 WHERE id = $1', [matched.id]).catch(() => null);
    }
    matched.usageCount = (matched.usageCount || 0) + 1;

    return {
      valid: true,
      discountAmount: discount,
      finalTotal,
      message: matched.discountType === 'PERCENTAGE' 
        ? `${matched.discountValue}% discount applied! (Saved ₹${discount})`
        : `Flat ₹${discount} discount applied!`,
      coupon: matched,
    };
  }
}
