import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../cancelBooking.command';
import {
  BookingRepository,
  HotelbedsProvider,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { BookingStatus, paymentStatus, PaymentType } from '@prisma/client';
import { BookingService } from '../../booking.service';
import { CancelBookingEvent } from '../../events/cancelBooking.event';
import { PaymentService } from 'src/modules/payment/payment.service';

@Injectable()
@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly providerService: HotelbedsProvider,
    private readonly eventBus: EventBus,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
  ) {}
  async execute(command: CancelBookingCommand): Promise<any> {
    const { user, bookingId, key, reason } = command;
    const lockKey = redisKeys.idempotencyKey(user.id, bookingId, key);
    const lockAcquired = await redis.set(
      lockKey,
      'processing',
      'EX',
      TTL.idempotencyKey,
      'NX',
    );

    if (!lockAcquired) {
      const existing = await redis.get(lockKey);
      if (existing === 'processing')
        throw new ConflictException(
          'cancel booking is being processed, please wait',
        );
      return JSON.parse(existing!);
    }
    try {
      const now = new Date();
      const booking = await this.bookingRepo.findOne({
        userId: user.id,
        id: bookingId,
      });
      if (!booking) throw new NotFoundException('booking not found');
      if (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.COMPLETED
      ) {
        throw new BadRequestException(
          `booking is already ${booking.status.toLowerCase()}`,
        );
      }
      const bookingCheckIn = new Date(booking.checkIn);
      if (bookingCheckIn <= now) {
        throw new BadRequestException(
          "can't cancel booking after check-in date",
        );
      }
      let result;
      if (
        booking.status === BookingStatus.PENDING ||
        booking.paymentType === PaymentType.AT_HOTEL
      ) {
        await this.bookingService.cancelBooking(
          user.id,
          booking.providerReference,
        );
        await this.eventBus.publish(new CancelBookingEvent(user, booking, 0));
        result = { message: 'booking canceled successfully' };
      } else if (
        booking.status === BookingStatus.CONFIRMED &&
        booking.paymentType === PaymentType.AT_WEB
      ) {
        const cancellationResult = await this.providerService.CancelBooking(
          booking.providerReference!,
        );
        const refundData = await this.paymentService.refund(
          booking.id,
          cancellationResult.refundAmount,
        );
        const updatedBooking = await this.bookingRepo.updateOne(
          { id: booking.id, userId: user.id },
          {
            status: BookingStatus.CANCELLED,
            refundAmount: cancellationResult.refundAmount,
            cancellationFees: cancellationResult.cancellationFee,
            cancellationReference: cancellationResult.cancellationReference,
            payment: {
              update: {
                status: paymentStatus.Refund,
              },
            },
          },
        );
        await this.eventBus.publish(
          new CancelBookingEvent(
            user,
            booking,
            cancellationResult.refundAmount,
          ),
        );
        result = {
          message: 'booking canceled successfully',
          refundAmount: cancellationResult.refundAmount,
          cancellationFee: cancellationResult.cancellationFee,
        };
      } else {
        throw new BadRequestException(
          `cannot cancel booking with status ${booking.status}`,
        );
      }
      await redis.set(
        lockKey,
        JSON.stringify(result),
        'EX',
        TTL.idempotencyKey,
      );
      return result;
    } catch (error) {
      await redis.del(lockKey);
      throw error;
    }
  }
}
