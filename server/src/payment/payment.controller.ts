import { Body, Controller, Post, Inject, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(@Inject(PaymentService) private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  createIntent(@Body() body: { amount: number; currency?: string; orderReference?: string }) {
    return this.paymentService.createPaymentIntent(body);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  verifyPayment(@Body() body: { transactionId: string; method: string; paymentDetails?: any }) {
    return this.paymentService.verifyPayment(body);
  }
}
