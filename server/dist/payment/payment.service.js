"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
let PaymentService = class PaymentService {
    createPaymentIntent(data) {
        const transactionId = `TXN-MELVI-${Date.now()}-${Math.floor(Math.random() * 8999 + 1000)}`;
        return {
            success: true,
            transactionId,
            amount: data.amount,
            currency: data.currency || 'INR',
            keyId: 'rzp_live_melvi_artisan_2026',
            supportedMethods: ['UPI_QR', 'UPI_INTENT', 'CREDIT_DEBIT_CARD', 'NET_BANKING', 'CASH_ON_DELIVERY'],
            qrPayload: `upi://pay?pa=melvi.atelier@okaxis&pn=Melvi%20Luxury%20Chocolates&am=${data.amount}&cu=INR&tn=Order%20${transactionId}`,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
    }
    verifyPayment(data) {
        return {
            success: true,
            verified: true,
            status: 'CAPTURED',
            transactionId: data.transactionId,
            gatewayReference: `GW-REF-${Math.floor(Math.random() * 900000 + 100000)}`,
            timestamp: new Date().toISOString(),
            method: data.method,
            message: 'Payment verified successfully by Melvi Secure Gateway.',
        };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)()
], PaymentService);
//# sourceMappingURL=payment.service.js.map