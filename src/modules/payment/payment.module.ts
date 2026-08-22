import { Module } from '@nestjs/common';
import { notificationModel } from 'src/common/DB';
import { PaymentController } from './paymnet.controller';
import { PaymentService } from './payment.service';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import {
  BookingRepository,
  PaymentRepository,
  StripeServices,
} from 'src/common';
import { PaymentGatewayFactory } from './payment.factory';

@Module({
  providers: [
    PaymentService,
    NotificationRepository,
    BookingRepository,
    PaymentRepository,
    PaymentGatewayFactory,
    StripeServices,
  ],
  controllers: [PaymentController],
  imports: [notificationModel],
  exports: [PaymentService],
})
export class PaymentModule {}
