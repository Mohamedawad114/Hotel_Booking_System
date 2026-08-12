import {
  Injectable,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { BookingRepository, HotelbedsProvider } from 'src/common';

@Injectable()
export class BookingService {
  constructor(
    private readonly providerService: HotelbedsProvider,
    private readonly bookingRepo: BookingRepository,
    private readonly logger: PinoLogger,
  ) {}

  cancelBooking = async (userId: number, bookingReference: string) => {
    if (!bookingReference) {
      this.logger.error('booking id is required');
      return;
    }
    const bookingCanceled = await this.providerService.CancelBooking(
      bookingReference,
      );
      if (bookingCanceled.success && bookingCanceled.cancellationReference) {
       await this.bookingRepo.updateOne({
         userId: userId,
         providerReference: bookingReference,
         status: BookingStatus.PENDING,
       }, {
           status: BookingStatus.CANCELLED,
           cancellationReference:bookingCanceled.cancellationReference
       });
          this.logger.info(`booking canceled , cancellationReference :${bookingCanceled.cancellationReference}`)
          return;
   }
  };
}
