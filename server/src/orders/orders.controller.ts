import { Body, Controller, Get, Param, Patch, Post, Query, Inject } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() body: any) {
    const order = await this.ordersService.createOrder(body);
    return { success: true, order };
  }

  @Get()
  async getAllOrders() {
    const orders = await this.ordersService.getAllOrders();
    return { orders };
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    const orders = await this.ordersService.getUserOrders(userId);
    return { orders };
  }

  @Get('history')
  async getOrderHistory(@Query('identifier') identifier: string) {
    const orders = await this.ordersService.getUserOrders(identifier);
    return { orders };
  }

  @Get('track/:trackingNumber')
  async trackOrder(@Param('trackingNumber') trackingNumber: string) {
    const order = await this.ordersService.trackOrder(trackingNumber);
    return { order };
  }

  @Patch(':id/tracking')
  async updateTracking(
    @Param('id') id: string,
    @Body() body: {
      status: string;
      title?: string;
      description?: string;
      location?: string;
      courierName?: string;
      estimatedDelivery?: string;
    }
  ) {
    const order = await this.ordersService.updateTrackingStatus(id, body);
    return { success: true, order };
  }
}
