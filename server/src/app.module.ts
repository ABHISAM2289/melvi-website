import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CustomizationModule } from './customization/customization.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    CatalogModule,
    CustomizationModule,
    OrdersModule,
    PaymentModule,
  ],
})
export class AppModule {}
