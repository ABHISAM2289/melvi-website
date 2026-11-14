export declare class PaymentService {
    createPaymentIntent(data: {
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
    verifyPayment(data: {
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
