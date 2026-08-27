import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BookingRepository,
  decoderCursor,
  encodedCursor,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { GetBookingsDto } from './Dto/getBookings.dto';

dayjs.extend(customParseFormat);

@Injectable()
export class DashboardBookingService {
  constructor(private readonly bookingRepo: BookingRepository) {}

  async getAllBookings(data: GetBookingsDto) {
    const cached = await redis.get(redisKeys.dashboardBookings(data));
    if (cached) return JSON.parse(cached);
    if (data.day && data.month)
      throw new BadRequestException('Use either day or month, not both');
    const dateFilter = this.getDateFilter(data.day, data.month);
    const decodedCursor = decoderCursor(data.cursor);
    const bookings = await this.bookingRepo.findMany(
      { ...(dateFilter ? { createdAt: dateFilter } : {}) },
      {
        skip: decodedCursor ? 1 : 0,
        cursor: decodedCursor ? { id: decodedCursor.id } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: data.limit,
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          totalPrice: true,
          currency: true,
          checkIn: true,
          checkOut: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    );
    if (!bookings.length) return { message: 'no bookings found ' };
    const lastItem = bookings[bookings.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem.id,
      value: lastItem.createdAt,
    });
    const res = {
      message: 'bookings',
      data: bookings,
      meta: { nextCursor },
    };
    await redis.setex(
      redisKeys.dashboardBookings({ ...data, cursor: nextCursor }),
      TTL.dashboard,
      JSON.stringify(res),
    );
    return res;
  }
  async getAllCanceledBookings(data: GetBookingsDto) {
    if (data.day && data.month)
      throw new BadRequestException('Use either day or month, not both');
    const dateFilter = this.getDateFilter(data.day, data.month);
    const decodedCursor = decoderCursor(data.cursor);
    const bookings = await this.bookingRepo.findMany(
      { ...(dateFilter ? { createdAt: dateFilter } : {}) },
      {
        skip: decodedCursor ? 1 : 0,
        cursor: decodedCursor
          ? { id: decodedCursor.id, createdAt: decodedCursor.value }
          : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: data.limit,
        select: {
          id: true,
          bookingNumber: true,
          status: true,
          totalPrice: true,
          currency: true,
          checkIn: true,
          checkOut: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    );
    if (!bookings.length) return { message: 'no bookings found ' };
    const lastItem = bookings[bookings.length - 1];
    const nextCursor = encodedCursor({
      id: lastItem.id,
      value: lastItem.createdAt,
    });
    return {
      message: 'bookings',
      data: bookings,
      meta: {
        nextCursor: nextCursor,
      },
    };
  }
  private getDateFilter(day?: string, month?: string) {
    if (day) {
      const parsedDay = dayjs(day, 'YYYY-MM-DD', true);
      if (!parsedDay.isValid()) throw new BadRequestException('day is invalid');
      return {
        gte: parsedDay.startOf('day').toDate(),
        lt: parsedDay.add(1, 'day').startOf('day').toDate(),
      };
    }
    if (month) {
      const parsedMonth = dayjs(month, 'YYYY-MM', true);
      if (!parsedMonth.isValid())
        throw new BadRequestException('month is invalid');
      return {
        gte: parsedMonth.startOf('month').toDate(),
        lt: parsedMonth.add(1, 'month').startOf('month').toDate(),
      };
    }
    return undefined;
  }
}
