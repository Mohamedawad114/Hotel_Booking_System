import { Module } from '@nestjs/common';
import { BookingRepository, EmailModule, UserRepository } from 'src/common';
import { DashboardUserService } from './dashboard-user.service';
import { DashboardController } from './dashboard.controller';
import { DashboardBookingService } from './dashboard-booking.service';

@Module({
  imports: [EmailModule],
  controllers: [DashboardController],
  providers: [
    DashboardUserService,
    DashboardBookingService,
    UserRepository,
    BookingRepository,
  ],
})
export class DashboardModule {}
