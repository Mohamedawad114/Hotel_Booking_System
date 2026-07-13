import { Module } from '@nestjs/common';
import {
  DestinationRepository,
  HotelRepository,
  ProviderModule,
} from 'src/common';
import { HotelServices } from './hotel.service';
import { HotelController } from './hotel.controller';
import { HotelTask } from './hotel.tasks';

@Module({
  imports: [ProviderModule],
  providers: [HotelServices, DestinationRepository, HotelRepository, HotelTask],
  controllers: [HotelController],
})
export class HotelModule {}
