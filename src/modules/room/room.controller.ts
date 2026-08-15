import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoomServices } from './room.service';
import { SearchRoomsDto } from './Dto/searchRooms.dto';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';

@ApiTags('rooms')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.User, Sys_Role.SuperAdmin, Sys_Role.SuperAdmin)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomServices) {}

  @Get(':hotelId')
  @ApiOperation({ summary: 'Get rooms for a hotel' })
  @ApiParam({ name: 'hotelId', type: Number, description: 'Hotel ID' })
  @ApiQuery({
    name: 'adults',
    required: false,
    type: Number,
    description: 'Number of adults',
  })
  @ApiQuery({
    name: 'children',
    required: false,
    type: Number,
    description: 'Number of children',
  })
  @ApiResponse({
    status: 200,
    description: 'Hotel rooms fetched successfully',
  })
  async getHotelRooms(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Query() filter: SearchRoomsDto,
  ) {
    return this.roomService.getHotelRooms(hotelId, filter);
  }

  @Get(':roomId/facilities')
  @ApiOperation({ summary: 'Get facilities for a room' })
  @ApiParam({ name: 'roomId', type: Number, description: 'Room ID' })
  @ApiResponse({
    status: 200,
    description: 'Room facilities fetched successfully',
  })
  async getRoomFacilities(@Param('roomId', ParseIntPipe) roomId: number) {
    return this.roomService.getRoomFacilities(roomId);
  }
}
