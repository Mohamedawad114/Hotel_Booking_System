import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HotelServices } from './hotel.service';
import { QueryDto } from './Dto/query.dto';
import { SearchHotelsDto } from './Dto/search.dto';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import { searchRoomsDto } from './Dto/searchRooms.dto';

@ApiTags('hotel')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelServices) {}

  @Get('search')
  @ApiOperation({ summary: 'Search hotels with filters and pagination' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Pagination cursor',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results per page',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Hotels fetched successfully' })
  async searchHotels(
    @Query('cursor') cursor?: string,
    @Query(
      'limit',
      new ParseIntPipe({ optional: true }),
      new DefaultValuePipe(20),
    )
    limit?: number,
    @Query() filter?: SearchHotelsDto,
  ) {
    const queryDto: QueryDto = { cursor, limit: limit ?? 20 };
    return await this.hotelService.getAllHotels(filter, queryDto);
  }

  @Get('hotel/:id')
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

  @Get(':id/rooms')
  @ApiOperation({ summary: 'Get rooms for a hotel' })
  @ApiParam({ name: 'id', type: Number, description: 'Hotel ID' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    type: String,
    description: 'Pagination cursor',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of results per page',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Hotel rooms fetched successfully' })
  async hotelRooms(
    @Param('id', ParseIntPipe) hotelId: number,
    @Query() filter: searchRoomsDto,
    @Query('cursor') cursor?: string,
    @Query(
      'limit',
      new ParseIntPipe({ optional: true }),
      new DefaultValuePipe(20),
    )
    limit?: number,
  ) {
    return await this.hotelService.getHotelRooms(
      hotelId,
      filter,
      cursor,
      limit,
    );
  }

  @Get(':id/facilities')
  @ApiOperation({ summary: 'Get facilities for a hotel' })
  @ApiParam({ name: 'id', type: Number, description: 'Hotel ID' })
  @ApiResponse({ status: 200, description: 'Hotel facilities fetched successfully' })
  @ApiResponse({ status: 404, description: 'Hotel not found' })
  async hotelFacilities(@Param('id', ParseIntPipe) hotelId: number) {
    return await this.hotelService.getHotelFacilities(hotelId);
  }

  @Get('rooms/:roomId/facilities')
  @ApiOperation({ summary: 'Get facilities for a room' })
  @ApiParam({ name: 'roomId', type: Number, description: 'Room ID' })
  @ApiResponse({ status: 200, description: 'Room facilities fetched successfully' })
  async roomFacilities(@Param('roomId', ParseIntPipe) roomId: number) {
    return await this.hotelService.getRoomFacilities(roomId);
  }
}
