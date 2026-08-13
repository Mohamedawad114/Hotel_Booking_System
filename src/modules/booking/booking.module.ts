import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingController } from './booking.controller';
import { BookingRepository, EmailModule, HotelRepository } from 'src/common';
import { ConfirmBookingHandler } from './events/handler/confirmBooking.event.handler';
import { ConfirmBookingEvent } from './events/confirmBooking.event';
import { SearchAvailabilityHandler } from './queries/handlers/searchAvailabilty.handler';
import { GetBookingsHandler } from './queries/handlers/getBookings.handler';
import { GetBookingDetailsHandler } from './queries/handlers/getBookingDetail.handler';
import { SelectRoomsHandler } from './commands/handlers/selectRooms.handler';
import { BookingJobModule } from 'src/common/Utils/services/Jobs/booking/bookingJob.module';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { notificationModel } from 'src/common/DB';

@Module({
  imports: [CqrsModule, BookingJobModule, EmailModule, notificationModel],
  controllers: [BookingController],
  providers: [
    BookingRepository,
    ConfirmBookingHandler,
    ConfirmBookingEvent,
    SearchAvailabilityHandler,
    GetBookingsHandler,
    GetBookingDetailsHandler,
    SelectRoomsHandler,
    NotificationRepository,
    HotelRepository,
  ],
})
export class BookingModule {}
