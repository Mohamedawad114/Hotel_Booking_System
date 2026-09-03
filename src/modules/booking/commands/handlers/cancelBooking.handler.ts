import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../cancelBooking.command';
import {
  BookingRepository,
  CancellationProducer,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { BookingStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly cancellationQueue: CancellationProducer,
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
      if (
        booking.status !== BookingStatus.PENDING &&
        booking.status !== BookingStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          `cannot cancel booking with status ${booking.status}`,
        );
      }
      await this.bookingRepo.updateOne(
        { id: booking.id, userId: user.id },
        { status: BookingStatus.CANCELLATION_PROCESSING },
      );
     await this.cancellationQueue.cancelBookingJob('process-cancellation', {
        userId: user.id,
        bookingId: booking.id,
        providerReference: booking.providerReference,
        paymentType: booking.paymentType,
        reason,
      });

      const result = {
        message: 'Cancellation request received and is being processed',
        status: 'PROCESSING',
      };
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
