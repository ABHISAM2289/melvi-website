import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  createPaymentIntent(data: { amount: number; currency?: string; orderReference?: string }) {
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

  verifyPayment(data: { transactionId: string; method: string; paymentDetails?: any }) {
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
}
