import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingController } from './booking.controller';
import { BookingRepository, EmailModule, HotelRepository } from 'src/common';
import { ConfirmBookingHandler } from './events/handler/confirmBooking.event.handler';
import { GetBookingsHandler } from './queries/handlers/getBookings.handler';
import { GetBookingDetailsHandler } from './queries/handlers/getBookingDetail.handler';
import { SelectRoomsHandler } from './commands/handlers/selectRooms.handler';
import { BookingJobModule } from 'src/common/Utils/services/Jobs/booking/bookingJob.module';
import { BookingResolver } from './booking.resolver';
import { SearchAvailabilityHandler } from './commands/handlers/searchAvailability.handler';
import { BookingHandler } from './commands/handlers/booking.handler';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';
import { GatewayModule } from '../gateway/gateway.module';
import { CancelBookingHandler } from './commands/handlers/cancelBooking.handler';
import { BookingService } from './booking.service';
@Module({
  imports: [
    CqrsModule,
    BookingJobModule,
    EmailModule,
    NotificationModule,
    PaymentModule,
    GatewayModule,
  ],
  controllers: [BookingController],
  providers: [
    BookingRepository,
    ConfirmBookingHandler,
    BookingHandler,
    SearchAvailabilityHandler,
    GetBookingsHandler,
    GetBookingDetailsHandler,
    SelectRoomsHandler,
    HotelRepository,
    BookingResolver,
    CancelBookingHandler,
    BookingService
  ],
})
export class BookingModule {}
