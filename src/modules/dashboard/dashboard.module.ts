import { Module } from '@nestjs/common';
import { BookingRepository, CryptoService, EmailModule, UserRepository } from 'src/common';
import { DashboardUserService } from './dashboard-user.service';
import { DashboardController } from './dashboard.controller';
import { DashboardBookingService } from './dashboard-booking.service';
import { DashboardPaymentService } from './dashboard-payment.service';
import { PaymentRepository } from 'src/common';

@Module({
  imports: [EmailModule],
  controllers: [DashboardController],
  providers: [
    DashboardUserService,
    DashboardBookingService,
    DashboardPaymentService,
    UserRepository,
    BookingRepository,
    PaymentRepository,
    CryptoService
  ],
})
export class DashboardModule {}
