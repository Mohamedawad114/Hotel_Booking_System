import { Module } from '@nestjs/common';
import {
  DestinationRepository,
  FacilityRepository,
  HotelFacilityRepository,
  HotelPhonesRepository,
  HotelRepository,
  ProviderModule,
  RoomFacilityRepository,
  RoomRepository,
} from 'src/common';
import { HotelServices } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelTask } from './hotel.tasks';
import { HotelResolver } from './hotel.resolver';
import { HotelPhoneLoader } from './hotelPhones.loader';

@Module({
  imports: [ProviderModule],
  providers: [
    HotelServices,
    DestinationRepository,
    HotelRepository,
    FacilityRepository,
    HotelTask,
    RoomRepository,
    RoomFacilityRepository,
    HotelFacilityRepository,
    HotelResolver,
    HotelPhoneLoader,
    HotelPhonesRepository,
  ],
  controllers: [HotelController],
})
export class HotelModule {}
