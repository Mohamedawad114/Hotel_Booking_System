import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingController } from './booking.controller';
import { BookingRepository, EmailModule, HotelRepository } from 'src/common';
import { ConfirmBookingHandler } from './events/handler/confirmBooking.event.handler';
import { GetBookingsHandler } from './queries/handlers/getBookings.handler';
import { GetBookingDetailsHandler } from './queries/handlers/getBookingDetail.handler';
import { SelectRoomsHandler } from './commands/handlers/selectRooms.handler';
import { BookingJobModule } from 'src/common/Utils/services/Jobs/booking/bookingJob.module';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { notificationModel } from 'src/common/DB';
import { BookingResolver } from './booking.resolver';
import { SearchAvailabilityHandler } from './commands/handlers/searchAvailability.handler';
import { BookingHandler } from './commands/handlers/booking.handler';
import { PaymentModule } from '../payment/payment.module';
@Module({
  imports: [CqrsModule, BookingJobModule, EmailModule, notificationModel,PaymentModule],
  controllers: [BookingController],
  providers: [
    BookingRepository,
    ConfirmBookingHandler,
    BookingHandler,
    SearchAvailabilityHandler,
    GetBookingsHandler,
    GetBookingDetailsHandler,
    SelectRoomsHandler,
    NotificationRepository,
    HotelRepository,
    BookingResolver,
  ],
})
export class BookingModule {}
