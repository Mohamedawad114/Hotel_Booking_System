import { Args, Int, Mutation, Resolver } from '@nestjs/graphql';
import { Auth, AuthUser, IdempotencyKey } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { BookingInput } from './dto/booking.dto';
import { CommandBus } from '@nestjs/cqrs';
import { BookingCommand } from './commands/booking.command';
import { type IUser } from 'src/common/interfaces';
import { BookingType } from './commands/booking.type';
import { Throttle } from '@nestjs/throttler';
@Auth(Sys_Role.User, Sys_Role.Admin)
@Resolver()
export class BookingResolver {
  constructor(private readonly commandBus: CommandBus) {}
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
}
