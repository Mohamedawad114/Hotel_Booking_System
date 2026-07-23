import { Module } from '@nestjs/common';
import { FavoriteServices } from './favorite.service';
import { Favorite_Controller } from './favorite.controller';
import { FavoriteRepository, HotelRepository } from 'src/common';

@Module({
  imports: [],
  providers: [FavoriteServices, FavoriteRepository, HotelRepository],
  controllers: [Favorite_Controller],
})
export class FavoriteModule {}
