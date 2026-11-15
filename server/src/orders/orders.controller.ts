import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AdminGuard, AuthenticatedRequest, JwtAuthGuard } from '../auth/auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: any, @Req() request: AuthenticatedRequest) {
    const order = await this.ordersService.createOrder({
      ...body,
      userId: request.user.sub,
    });
    return { success: true, order };
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllOrders() {
    const orders = await this.ordersService.getAllOrders();
    return { orders };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserOrders(@Param('userId') userId: string, @Req() request: AuthenticatedRequest) {
    this.assertOwnAccount(request, userId);
    const orders = await this.ordersService.getUserOrders(userId);
    return { orders };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getOrderHistory(@Query('identifier') identifier: string, @Req() request: AuthenticatedRequest) {
    this.assertOwnAccount(request, identifier);
    const orders = await this.ordersService.getUserOrders(identifier);
    return { orders };
  }

  @Get('track/:trackingNumber')
  @UseGuards(JwtAuthGuard)
  async trackOrder(
    @Param('trackingNumber') trackingNumber: string,
    @Req() request: AuthenticatedRequest
  ) {
    const order = await this.ordersService.trackOrder(trackingNumber);
    if (
      request.user.role !== 'admin' &&
      (!order || order.userId !== request.user.sub)
    ) {
      throw new ForbiddenException('You can only view your own order tracking information.');
    }
    return { order };
  }

  @Patch(':id/tracking')
  @UseGuards(JwtAuthGuard, AdminGuard)
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

  private assertOwnAccount(request: AuthenticatedRequest, identifier: string) {
    const requested = (identifier || '').toLowerCase();
    const isOwnAccount = [request.user.sub, request.user.email, request.user.username]
      .some(value => value.toLowerCase() === requested);

    if (request.user.role !== 'admin' && !isOwnAccount) {
      throw new ForbiddenException('You can only access your own orders.');
    }
  }
}
