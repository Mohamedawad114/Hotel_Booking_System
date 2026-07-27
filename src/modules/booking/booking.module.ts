import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingRepository } from 'src/common';

@Module({
  imports: [],
  controllers: [BookingController],
  providers: [BookingRepository],
})
export class BookingModule {}
