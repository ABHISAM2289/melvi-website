import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(body: any): Promise<{
        success: boolean;
        order: import("./orders.service").Order;
    }>;
    getAllOrders(): Promise<{
        orders: import("./orders.service").Order[];
    }>;
    getUserOrders(userId: string): Promise<{
        orders: import("./orders.service").Order[];
    }>;
    getOrderHistory(identifier: string): Promise<{
        orders: import("./orders.service").Order[];
    }>;
    trackOrder(trackingNumber: string): Promise<{
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
}
