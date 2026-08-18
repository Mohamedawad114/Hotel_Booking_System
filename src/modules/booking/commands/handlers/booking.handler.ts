import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BookingCommand } from '../booking.command';
import {
  BookingRepository,
  HotelbedsProvider,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { ConfirmBookingEvent } from '../../events/confirmBooking.event';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
@CommandHandler(BookingCommand)
export class BookingHandler implements ICommandHandler<BookingCommand> {
  constructor(
    private readonly providerServices: HotelbedsProvider,
    private readonly bookingRepository: BookingRepository,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: BookingCommand) {
    const { user, hotelCode, idempotencyKey, dto } = command;
    const bookingNumber = `BK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userLockKey = redisKeys.userLock(user.id);
    const userLockAcquired = await redis.set(
      userLockKey,
      '1',
      'EX',
      TTL.userLock,
      'NX',
    );
    if (!userLockAcquired)
      throw new ConflictException(
        'you already have a booking in progress, please wait until it completes',
      );
    let providerBooking: boolean = false;
    let lockKey: string | undefined;
    try {
      lockKey = redisKeys.idempotencyKey(user.id, hotelCode, idempotencyKey);
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
            'booking is being processed, please wait',
          );
        return JSON.parse(existing!);
      }
      const raw = await redis.get(redisKeys.selectionRooms(hotelCode, user.id));
      if (!raw) {
        throw new ConflictException(
          'no room selections found for this user and hotel',
        );
      }
      const data = JSON.parse(raw);
      if (data.rooms.length !== dto.rooms.length) {
        throw new BadRequestException(
          'guests data does not match the number of selected rooms',
        );
      }
      const rateKeys = data.rooms.map((s: any) => s.rateKey);
      const rates = await this.providerServices.checkRates(rateKeys);
      const unavailable = rates.filter((r) => !r.stillAvailable);
      if (unavailable.length) {
        throw new BadRequestException(
          `${unavailable.length} room(s) are no longer available`,
        );
      }
      const rooms = data.rooms.map((s: any, i: number) => ({
        rateKey: rates[i].newRateKey,
        adultsCount: s.adults,
        childrenCount: s.children,
        guests: dto.rooms[i].guests,
      }));
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      const booking = await this.providerServices.confirmBooking(
        hotelCode,
        bookingNumber,
        checkIn,
        checkOut,
        rooms,
        dto,
      );
      providerBooking = true;
      const bookingCreated = await this.bookingRepository.createBooking(
        user.id,
        bookingNumber,
        booking,
      );
      await redis.setex(
        lockKey,
        TTL.idempotencyKey,
        JSON.stringify(bookingCreated),
      );
      this.eventBus.publish(
        new ConfirmBookingEvent(user, hotelCode, bookingCreated),
      );
      return bookingCreated;
    } catch (err: any) {
      if (providerBooking) {
        this.logger.error(
          `CRITICAL: provider booking ${bookingNumber} succeeded but DB save failed: ${err.message}`,
        );
        throw new InternalServerErrorException(
          'booking confirmed but failed to save, please contact support',
        );
      }
      if (lockKey) await redis.del(lockKey);
      throw err;
    } finally {
      await redis.del(userLockKey);
    }
  }
}
