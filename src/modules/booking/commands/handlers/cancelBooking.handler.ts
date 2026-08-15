import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../cancelBooking.command';
import { BookingRepository, HotelbedsProvider } from 'src/common';
import { BookingStatus } from '@prisma/client';
import { BookingService } from '../../booking.service';
import { CancelBookingEvent } from '../../events/cancelBooking.event';

@Injectable()
@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly providerService: HotelbedsProvider,
    private readonly eventBus: EventBus,
    private readonly bookingService: BookingService,
  ) {}
  async execute(command: CancelBookingCommand): Promise<any> {
    const { user, bookingId } = command;
    const now = new Date();
    const booking = await this.bookingRepo.findOne({
      userId: user.id,
      id: bookingId,
    });
    if (!booking) throw new NotFoundException('booking not found');
    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    )
      throw new BadRequestException(
        `booking is already ${booking.status.toLowerCase()}`,
      );
    const bookingCheckIn = new Date(booking.checkIn);
    if (bookingCheckIn <= now)
      throw new BadRequestException("can't cancel booking after check-in date");
    if (booking.status === BookingStatus.PENDING) {
      await this.bookingService.cancelBooking(
        user.id,
        booking.providerReference,
      );
      await this.eventBus.publish(new CancelBookingEvent(user, booking, 0));
      return { message: 'booking canceled successfully' };
    }
    if (booking.status === BookingStatus.CONFIRMED) {
      const cancellationResult = await this.providerService.CancelBooking(
        booking.providerReference!,
      );
        const updatedBooking = await this.bookingRepo.cancelWithRefund(
          booking.id,
          {
            refundAmount: cancellationResult.refundAmount,    /// build payment model
            cancellationFee: cancellationResult.cancellationFee,
          },
        );
      await this.eventBus.publish(
        new CancelBookingEvent(user, booking, cancellationResult.refundAmount),
      );
      return {
        message: 'booking canceled successfully',
        refundAmount: cancellationResult.refundAmount,
        cancellationFee: cancellationResult.cancellationFee,
      };
    }
    throw new BadRequestException(
      `cannot cancel booking with status ${booking.status}`,
    );
  }
}
