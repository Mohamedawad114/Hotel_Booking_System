import { Module } from '@nestjs/common';
import { ReviewServices } from './review.service';
import { Review_Controller } from './review.controller';
import { HotelRepository, ReviewRepository } from 'src/common';

@Module({
  imports: [],
  providers: [ReviewServices, ReviewRepository, HotelRepository],
  controllers: [Review_Controller],
})
export class ReviewModule {}
