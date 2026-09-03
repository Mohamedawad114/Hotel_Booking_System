import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BookingStatus, paymentStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { BookingRepository, HotelbedsProvider } from 'src/common';

@Injectable()
export class BookingService {
  constructor(
    @Inject(forwardRef(() => HotelbedsProvider))
    private readonly providerService: HotelbedsProvider,
    @Inject(forwardRef(() => BookingRepository))
    private readonly bookingRepo: BookingRepository,
    private readonly logger: PinoLogger,
  ) {}

  cancelBooking = async (
    userId: number,
    bookingReference: string,
    paymentId?: string,
  ) => {
    if (!bookingReference) {
      this.logger.error('booking id is required');
      return;
    }
    const bookingCanceled =
      await this.providerService.CancelBooking(bookingReference);
    if (bookingCanceled.success && bookingCanceled.cancellationReference) {
      await this.bookingRepo.transaction(async (tx) => {
        await tx.booking.update({
          where: {
            userId: userId,
            providerReference: bookingReference,
          },
          data: {
            status: BookingStatus.CANCELLED,
            cancellationReference: bookingCanceled.cancellationReference,
          },
        });
        if (paymentId) {
          await tx.payment.update({
            where: { id: Number(paymentId) },
            data: { status: paymentStatus.failed },
          });
        }
      });
      this.logger.info(
        `booking canceled , cancellationReference :${bookingCanceled.cancellationReference}`,
      );
      return;
    } else {
      this.logger.error(
        `Failed to cancel booking at provider for reference: ${bookingReference}`,
      );
    }
  };
}
