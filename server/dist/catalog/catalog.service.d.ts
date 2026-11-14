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
export declare class CatalogService {
    private readonly db;
    private fallbackProducts;
    private fallbackBanners;
    private fallbackCoupons;
    constructor(db: DatabaseService);
    getProducts(category?: string): Promise<Product[]>;
    addProduct(data: Partial<Product>): Promise<Product>;
    deleteProduct(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    updateProduct(id: string, data: Partial<Product>): Promise<Product>;
    getBanners(all?: boolean): Promise<Banner[]>;
    addBanner(data: Partial<Banner>): Promise<Banner>;
    updateBanner(id: string, data: Partial<Banner>): Promise<Banner>;
    deleteBanner(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    uploadToR2(fileName: string, mimeType: string, base64Data?: string): {
        success: boolean;
        provider: string;
        bucket: string;
        key: string;
        url: string;
        previewUrl: string;
    };
    getCoupons(all?: boolean): Promise<Coupon[]>;
    createCoupon(data: Partial<Coupon>): Promise<Coupon>;
    updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon>;
    deleteCoupon(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    validateCoupon(code: string, subtotal: number): Promise<{
        valid: boolean;
        discountAmount: number;
        finalTotal: number;
        message: string;
        coupon?: Coupon;
    }>;
}
