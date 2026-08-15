import { Module } from '@nestjs/common';
import {
  HotelRepository,
  RoomFacilityRepository,
  RoomRepository,
} from 'src/common';
import { RoomServices } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [],
  providers: [
    RoomRepository,
    RoomServices,
    RoomFacilityRepository,
    HotelRepository,
  ],
  controllers: [RoomController],
})
export class RoomModule {}
