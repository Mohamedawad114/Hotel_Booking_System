import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBookingDetails } from '../getBooking.query';
import { BookingRepository } from 'src/common';
import { Sys_Role } from 'src/common/enums';

@Injectable()
@QueryHandler(GetBookingDetails)
export class GetBookingDetailsHandler implements IQueryHandler<GetBookingDetails> {
  constructor(private readonly bookingRepo: BookingRepository) {}

  async execute(query: GetBookingDetails): Promise<any> {
    const { bookingId, user } = query;
    if (!bookingId) throw new NotFoundException('booking id is required');
    const booking = await this.bookingRepo.findUnique(
      { id: bookingId },
      {
        include: {
          rooms: true,
          payment: true,
          user: true,
        },
      },
    );
    if (!booking) throw new NotFoundException('booking not found');
    // authorize: allow admins or owner
    if (user.role !== Sys_Role.Admin && user.role !== Sys_Role.SuperAdmin) {
      if (booking.userId !== user.id)
        throw new ForbiddenException('access denied');
    }
    return { message: 'booking detail', data: booking };
  }
}
