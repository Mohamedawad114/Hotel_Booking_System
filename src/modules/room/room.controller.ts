import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoomServices } from './room.service';
import { SearchRoomsDto } from './Dto/searchRooms.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomServices) {}

  @Get(':hotelId')
  async getHotelRooms(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Query() filter: SearchRoomsDto,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.roomService.getHotelRooms(hotelId, filter, cursor, limit);
  }

  @Get(':hotelId/:roomCode/facilities')
  async getRoomFacilities(
    @Param('roomCode') roomCode: string,
    @Param('hotelId', ParseIntPipe) hotelId: number,
  ) {
    return this.roomService.getRoomFacilities(roomCode, hotelId);
  }
}
