import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(@Inject(CatalogService) private readonly catalogService: CatalogService) { }

  @Get('products')
  async getProducts(@Query('category') category?: string) {
    const products = await this.catalogService.getProducts(category);
    return { products };
  }

  @Post('products')
  async addProduct(@Body() body: any) {
    const product = await this.catalogService.addProduct(body);
    return { success: true, product };
  }

  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const product = await this.catalogService.updateProduct(id, body);
    return { success: true, product };
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }

  @Get('banners')
  async getBanners(@Query('all') all?: string) {
    const banners = await this.catalogService.getBanners(all === 'true');
    return { banners };
  }

  @Post('banners')
  async addBanner(@Body() body: any) {
    const banner = await this.catalogService.addBanner(body);
    return { success: true, banner };
  }

  @Put('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() body: any) {
    const banner = await this.catalogService.updateBanner(id, body);
    return { success: true, banner };
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return this.catalogService.deleteBanner(id);
  }

  // --- PROMO CODES / COUPONS ROUTES ---

  @Get('coupons')
  async getCoupons(@Query('all') all?: string) {
    const coupons = await this.catalogService.getCoupons(all === 'true');
    return { coupons };
  }

  @Post('coupons')
  async createCoupon(@Body() body: any) {
    const coupon = await this.catalogService.createCoupon(body);
    return { success: true, coupon };
  }

  @Put('coupons/:id')
  async updateCoupon(@Param('id') id: string, @Body() body: any) {
    const coupon = await this.catalogService.updateCoupon(id, body);
    return { success: true, coupon };
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    return this.catalogService.deleteCoupon(id);
  }

  @Post('coupons/validate')
  async validateCoupon(@Body() body: { code: string; subtotal: number }) {
    return this.catalogService.validateCoupon(body.code, body.subtotal);
  }

  // Cloudflare R2 Upload Endpoint
  @Post('upload-r2')
  uploadImageToR2(@Body() body: { fileName: string; mimeType: string; base64Data?: string }) {
    return this.catalogService.uploadToR2(body.fileName, body.mimeType, body.base64Data);
  }
}
