import { OrdersService } from './orders.service';
import { AuthenticatedRequest } from '../auth/auth.guard';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(body: any, request: AuthenticatedRequest): Promise<{
        success: boolean;
        order: import("./orders.service").Order;
    }>;
    getAllOrders(): Promise<{
        orders: import("./orders.service").Order[];
    }>;
    getUserOrders(userId: string, request: AuthenticatedRequest): Promise<{
        orders: import("./orders.service").Order[];
    }>;
    getOrderHistory(identifier: string, request: AuthenticatedRequest): Promise<{
        orders: import("./orders.service").Order[];
    }>;
    trackOrder(trackingNumber: string, request: AuthenticatedRequest): Promise<{
        order: import("./orders.service").Order;
    }>;
    updateTracking(id: string, body: {
        status: string;
        title?: string;
        description?: string;
        location?: string;
        courierName?: string;
        estimatedDelivery?: string;
    }): Promise<{
        success: boolean;
        order: import("./orders.service").Order;
    }>;
    private assertOwnAccount;
}
