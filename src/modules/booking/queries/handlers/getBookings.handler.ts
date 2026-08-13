import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBookingsQuery } from '../getBookings.query';
import { BookingRepository } from 'src/common';
import { BadRequestException } from '@nestjs/common';

@QueryHandler(GetBookingsQuery)
export class GetBookingsHandler implements IQueryHandler<GetBookingsQuery> {
  constructor(private readonly bookingRepo: BookingRepository) {}

  async execute(query: GetBookingsQuery) {
    const { userId, page = 1, limit = 20 } = query;
    if (!userId) throw new BadRequestException('userId is required');
    const offset = (page - 1) * limit;
    const [total, bookings] = await Promise.all([
      this.bookingRepo.count({ userId }),
      this.bookingRepo.findMany(
        { userId },
        {
          select: {
            id: true,
            providerReference: true,
            totalPrice: true,
            status: true,
          },
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        },
      ),
    ]);
    return {
      message: 'bookings',
      data: bookings,
      meta: { page, limit, total },
    };
  }
}
