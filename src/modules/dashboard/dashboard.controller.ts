import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { DashboardUserService } from './dashboard-user.service';
import { DashboardBookingService } from './dashboard-booking.service';
import { GetBookingsDto } from './Dto/getBookings.dto';

@ApiTags('dashboard/users')
@ApiBearerAuth('access-token')
@Controller('dashboard/users')
@Auth(Sys_Role.Admin, Sys_Role.SuperAdmin)
export class DashboardController {
  constructor(
    private readonly dashboardUserService: DashboardUserService,
    private readonly dashboardBookingService: DashboardBookingService,
  ) {}

  @Get('bookings')
  @ApiOperation({
    summary: 'Get bookings with cursor pagination and date filter',
  })
  @ApiQuery({ required: false, type: GetBookingsDto })
  @ApiResponse({ status: 200, description: 'Bookings fetched successfully' })
  getAllBookings(@Query() dto: GetBookingsDto) {
    return this.dashboardBookingService.getAllBookings(dto);
  }
  @Get()
  @ApiOperation({
    summary: 'Get all users with optional search and city filter',
  })
  getAllUsers(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('page', ParseIntPipe, new DefaultValuePipe(1)) page?: number,
    @Query('pageSize', ParseIntPipe, new DefaultValuePipe(20))
    pageSize?: number,
  ) {
    return this.dashboardUserService.getAllUsers(search, city, page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  getUserDetails(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardUserService.getUserDetails(id);
  }

  @Patch(':id/ban')
  @ApiOperation({ summary: 'Ban or unban a user' })
  banUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('banned') banned = 'true',
  ) {
    const isBanned = banned !== 'false';
    return this.dashboardUserService.banUser(id, isBanned);
  }
}
