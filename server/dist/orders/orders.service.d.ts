import { DatabaseService } from '../database/database.service';
export interface TrackingEvent {
    id: string;
    orderId: string;
    status: string;
    title: string;
    description: string;
    location?: string;
    timestamp: string;
}
export interface Order {
    id: string;
    trackingNumber: string;
    userId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: string;
    city?: string;
    pincode?: string;
    items: any[];
    customBoxSpecs?: any;
    customNotes?: string;
    giftMessage?: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    courierName: string;
    estimatedDelivery: string;
    currentCheckpoint?: string;
    createdAt: string;
    updatedAt: string;
    trackingEvents: TrackingEvent[];
}
export declare class OrdersService {
    private readonly db;
    private inMemoryOrders;
    constructor(db: DatabaseService);
    private generateTrackingNumber;
    createOrder(data: {
        userId?: string;
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        shippingAddress: string;
        city?: string;
        pincode?: string;
        items: any[];
        customBoxSpecs?: any;
        customNotes?: string;
        giftMessage?: string;
        totalAmount: number;
        paymentMethod: string;
    }): Promise<Order>;
    getAllOrders(): Promise<Order[]>;
    getUserOrders(userIdOrEmail: string): Promise<Order[]>;
    trackOrder(identifier: string): Promise<Order>;
    updateTrackingStatus(orderId: string, update: {
        status: string;
        title?: string;
        description?: string;
        location?: string;
        courierName?: string;
        estimatedDelivery?: string;
    }): Promise<Order>;
}
