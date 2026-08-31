import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HotelServices } from './hotel.service';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';

@ApiTags('hotel')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelServices) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get hotel details by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Hotel ID' })
  @ApiResponse({
    status: 200,
    description: 'Hotel details fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async hotelDetailed(@Param('id', ParseIntPipe) hotelId: number) {
    return await this.hotelService.getHotelById(hotelId);
  }

  @Get(':id/facilities')
  @ApiOperation({ summary: 'Get facilities for a hotel' })
  @ApiParam({ name: 'id', type: Number, description: 'Hotel ID' })
  @ApiResponse({
    status: 200,
    description: 'Hotel facilities fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async hotelFacilities(@Param('id', ParseIntPipe) hotelId: number) {
    return await this.hotelService.getHotelFacilities(hotelId);
  }
}
