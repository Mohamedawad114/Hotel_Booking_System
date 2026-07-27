import { Module } from '@nestjs/common';
import { ProviderModule, RoomRepository } from 'src/common';
import { RoomServices } from './room.service';
import { RoomController } from './room.controller';

@Module({
  imports: [ProviderModule],
  providers: [RoomRepository, RoomServices],
  controllers: [RoomController],
})
export class RoomModule {}
