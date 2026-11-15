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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
const auth_guard_1 = require("../auth/auth.guard");
let CatalogController = class CatalogController {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async getProducts(category) {
        const products = await this.catalogService.getProducts(category);
        return { products };
    }
    async addProduct(body) {
        const product = await this.catalogService.addProduct(body);
        return { success: true, product };
    }
    async updateProduct(id, body) {
        const product = await this.catalogService.updateProduct(id, body);
        return { success: true, product };
    }
    async deleteProduct(id) {
        return this.catalogService.deleteProduct(id);
    }
    async getBanners(all) {
        const banners = await this.catalogService.getBanners(all === 'true');
        return { banners };
    }
    async addBanner(body) {
        const banner = await this.catalogService.addBanner(body);
        return { success: true, banner };
    }
    async updateBanner(id, body) {
        const banner = await this.catalogService.updateBanner(id, body);
        return { success: true, banner };
    }
    async deleteBanner(id) {
        return this.catalogService.deleteBanner(id);
    }
    async getCoupons(all) {
        const coupons = await this.catalogService.getCoupons(all === 'true');
        return { coupons };
    }
    async createCoupon(body) {
        const coupon = await this.catalogService.createCoupon(body);
        return { success: true, coupon };
    }
    async updateCoupon(id, body) {
        const coupon = await this.catalogService.updateCoupon(id, body);
        return { success: true, coupon };
    }
    async deleteCoupon(id) {
        return this.catalogService.deleteCoupon(id);
    }
    async validateCoupon(body) {
        return this.catalogService.validateCoupon(body.code, body.subtotal);
    }
    uploadImageToR2(body) {
        return this.catalogService.uploadToR2(body.fileName, body.mimeType, body.base64Data);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('banners'),
    __param(0, (0, common_1.Query)('all')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getBanners", null);
__decorate([
    (0, common_1.Post)('banners'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "addBanner", null);
__decorate([
    (0, common_1.Put)('banners/:id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateBanner", null);
__decorate([
    (0, common_1.Delete)('banners/:id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteBanner", null);
__decorate([
    (0, common_1.Get)('coupons'),
    __param(0, (0, common_1.Query)('all')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getCoupons", null);
__decorate([
    (0, common_1.Post)('coupons'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createCoupon", null);
__decorate([
    (0, common_1.Put)('coupons/:id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateCoupon", null);
__decorate([
    (0, common_1.Delete)('coupons/:id'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteCoupon", null);
__decorate([
    (0, common_1.Post)('coupons/validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "validateCoupon", null);
__decorate([
    (0, common_1.Post)('upload-r2'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, auth_guard_1.AdminGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "uploadImageToR2", null);
exports.CatalogController = CatalogController = __decorate([
    (0, common_1.Controller)('catalog'),
    __param(0, (0, common_1.Inject)(catalog_service_1.CatalogService)),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map