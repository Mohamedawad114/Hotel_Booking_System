import { Controller, Get, Query } from '@nestjs/common';
import { HotelServices } from './hotel.service';
import { QueryDto } from './Dto/query.dto';
import { SearchHotelsDto } from './Dto/search.dto';

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelServices) {}
  @Get('search')
  async searchHotels(@Query() QueryDto: QueryDto, @Query() filter: SearchHotelsDto) {
    await this.hotelService.getAllHotels(filter, QueryDto);
  }
}
