import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createIntent(body: {
        amount: number;
        currency?: string;
        orderReference?: string;
    }): {
        success: boolean;
        transactionId: string;
        amount: number;
        currency: string;
        keyId: string;
        supportedMethods: string[];
        qrPayload: string;
        expiresAt: string;
    };
    verifyPayment(body: {
        transactionId: string;
        method: string;
        paymentDetails?: any;
    }): {
        success: boolean;
        verified: boolean;
        status: string;
        transactionId: string;
        gatewayReference: string;
        timestamp: string;
        method: string;
        message: string;
    };
}
