import { Body, Controller, Post, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  createIntent(@Body() body: { amount: number; currency?: string; orderReference?: string }) {
    return this.paymentService.createPaymentIntent(body);
  }

  @Post('verify')
  verifyPayment(@Body() body: { transactionId: string; method: string; paymentDetails?: any }) {
    return this.paymentService.verifyPayment(body);
  }
}
