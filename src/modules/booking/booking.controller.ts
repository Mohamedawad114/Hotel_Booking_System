import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Query,
  ParseIntPipe,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser, IdempotencyKey } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { type IUser } from 'src/common/interfaces';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBookingsQuery } from './queries/getBookings.query';
import { GetBookingDetails } from './queries/getBooking.query';
import { CancelBookingCommand } from './commands/cancelBooking.command';
import { SearchAvailabilityQuery } from './queries/searchAvailabilty.query';
import { SearchAvailabilityDto } from './dto/checkAvailability.dto';

@ApiTags('booking')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.Admin, Sys_Role.User)
@Controller('booking')
export class BookingController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Delete('/:bookingId/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'cancel bookings ' })
  async cancelBooking(
    @AuthUser() user: IUser,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @IdempotencyKey() key: string,
  ) {
    return await this.commandBus.execute(
      new CancelBookingCommand(user, bookingId, key),
    );
  }
  @Get('')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get bookings (offset pagination)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Bookings fetched successfully' })
  async getBookings(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return await this.queryBus.execute(
      new GetBookingsQuery(user.id, page, limit),
    );
  }
  @Get(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get booking details by id' })
  @ApiResponse({
    status: 200,
    description: 'Booking detail fetched successfully',
  })
  async getBookingDetail(
    @AuthUser() user: IUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.queryBus.execute(new GetBookingDetails(user, id));
  }
  @Get('/:hotelId/searchAvailability')
  @HttpCode(200)
  @ApiOperation({ summary: 'search rooms availability' })
  @ApiResponse({
    status: 200,
    description: 'search rooms availability',
  })
  async searchAvailability(
    @Param('hotelId', ParseIntPipe) id: number,
    @Query() queryDto: SearchAvailabilityDto,
  ) {
    return await this.queryBus.execute(
      new SearchAvailabilityQuery(id, queryDto),
    );
  }
}
