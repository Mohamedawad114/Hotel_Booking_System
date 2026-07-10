import { Module } from '@nestjs/common';
import { DestinationRepository, ProviderModule } from 'src/common';
import { HotelServices } from './hotel.service';
import { HotelController } from './hotel.controller';

@Module({
  imports: [ProviderModule],
  providers: [HotelServices,DestinationRepository],
  controllers: [HotelController],
})
export class HotelModule {}
