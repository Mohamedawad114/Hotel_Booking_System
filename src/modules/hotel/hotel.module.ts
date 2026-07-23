import { Module } from '@nestjs/common';
import {
  DestinationRepository,
  FacilityRepository,
  HotelFacilityRepository,
  HotelRepository,
  ProviderModule,
  RoomFacilityRepository,
  RoomRepository,
} from 'src/common';
import { HotelServices } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelTask } from './hotel.tasks';

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
  ],
  controllers: [HotelController],
})
export class HotelModule {}
