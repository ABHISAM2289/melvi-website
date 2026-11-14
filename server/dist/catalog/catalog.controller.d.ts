import { CatalogService } from './catalog.service';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    getProducts(category?: string): Promise<{
        products: import("./catalog.service").Product[];
    }>;
    addProduct(body: any): Promise<{
        success: boolean;
        product: import("./catalog.service").Product;
    }>;
    updateProduct(id: string, body: any): Promise<{
        success: boolean;
        product: import("./catalog.service").Product;
    }>;
    deleteProduct(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    getBanners(all?: string): Promise<{
        banners: import("./catalog.service").Banner[];
    }>;
    addBanner(body: any): Promise<{
        success: boolean;
        banner: import("./catalog.service").Banner;
    }>;
    updateBanner(id: string, body: any): Promise<{
        success: boolean;
        banner: import("./catalog.service").Banner;
    }>;
    deleteBanner(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    getCoupons(all?: string): Promise<{
        coupons: import("./catalog.service").Coupon[];
    }>;
    createCoupon(body: any): Promise<{
        success: boolean;
        coupon: import("./catalog.service").Coupon;
    }>;
    updateCoupon(id: string, body: any): Promise<{
        success: boolean;
        coupon: import("./catalog.service").Coupon;
    }>;
    deleteCoupon(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    validateCoupon(body: {
        code: string;
        subtotal: number;
    }): Promise<{
        valid: boolean;
        discountAmount: number;
        finalTotal: number;
        message: string;
        coupon?: import("./catalog.service").Coupon;
    }>;
    uploadImageToR2(body: {
        fileName: string;
        mimeType: string;
        base64Data?: string;
    }): {
        success: boolean;
        provider: string;
        bucket: string;
        key: string;
        url: string;
        previewUrl: string;
    };
}
