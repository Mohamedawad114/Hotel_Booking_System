import { Module } from '@nestjs/common';
import {
  ProviderModule,
  RoomFacilityRepository,
  RoomRepository,
} from 'src/common';
import { RoomServices } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [ProviderModule],
  providers: [RoomRepository, RoomServices, RoomFacilityRepository],
  controllers: [RoomController],
})
export class RoomModule {}
