import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth, AuthUser, IdempotencyKey } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { BookingInput } from './dto/booking.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BookingCommand } from './commands/booking.command';
import { type IUser } from 'src/common/interfaces';
import { Throttle } from '@nestjs/throttler';
import { GetBookingDetails } from './queries/getBooking.query';
import { BookingType } from './types/booking.type';
import { bookingDetails } from './types/bookingDetails.type';
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Resolver()
export class BookingResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Throttle({ booking: { limit: 5, ttl: 60 } })
  @Mutation(() => BookingType, { name: 'createBooking' })
  async createBooking(
    @AuthUser() user: IUser,
    @Args('input') inputDto: BookingInput,
    @IdempotencyKey() key: string,
    @Args('hotelId', { type: () => Int }) hotelId: number,
  ) {
    return await this.commandBus.execute(
      new BookingCommand(user, hotelId, key, inputDto),
    );
  }
  @Query(() => bookingDetails, { name: 'getBookingDetails' })
  async getBookingDetails(
    @AuthUser() user: IUser,
    @Args('hotelId', { type: () => Int }) hotelId: number,
  ) {
    return await this.queryBus.execute(new GetBookingDetails(user, hotelId));
  }
}
