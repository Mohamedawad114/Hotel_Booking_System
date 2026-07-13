import { Controller, Get, Param, Query } from '@nestjs/common';
import { HotelServices } from './hotel.service';
import { QueryDto } from './Dto/query.dto';
import { SearchHotelsDto } from './Dto/search.dto';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelServices) {}
  @Get('search')
  async searchHotels(
    @Query() QueryDto: QueryDto,
    @Query() filter: SearchHotelsDto,
  ) {
    return await this.hotelService.getAllHotels(filter, QueryDto);
  }

  @Get('hotel/:id')
  async HotelDetailed(@Param('id') hotelId: number) {
    return await this.hotelService.getHotelById(hotelId);
  }
  // @Get('search')
  // async searchHotels(
  //   @Query() QueryDto: QueryDto,
  //   @Query() filter: SearchHotelsDto,
  // ) {
  //   return await this.hotelService.getAllHotels(filter, QueryDto);
  // }
  // @Get('search')
  // async searchHotels(
  //   @Query() QueryDto: QueryDto,
  //   @Query() filter: SearchHotelsDto,
  // ) {
  //   return await this.hotelService.getAllHotels(filter, QueryDto);
  // }
}
