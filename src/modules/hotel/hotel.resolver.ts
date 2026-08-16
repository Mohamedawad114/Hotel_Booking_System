import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { Hotel, HotelPhones, HotelsResponse } from './types/getAllHotels.type';
import { HotelServices } from './hotel.service';
import { SearchArgs } from './Dto/search.dto';
import { HotelPhoneLoader } from './hotelPhones.loader';
import { Auth } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
@Auth(Sys_Role.SuperAdmin, Sys_Role.User, Sys_Role.Admin)
@Resolver(() => Hotel)
export class HotelResolver {
  constructor(
    private readonly hotelService: HotelServices,
    private readonly hotelPhoneLoader: HotelPhoneLoader,
  ) {}

  @Query(() => HotelsResponse, { name: 'searchHotels' })
  async searchHotels(@Args() args: SearchArgs) {
    return this.hotelService.getAllHotels(args);
  }
  @ResolveField(() => [HotelPhones], { nullable: true })
  async phones(@Parent() hotel: Hotel) {
    return this.hotelPhoneLoader.load(hotel.id);
  }
}
