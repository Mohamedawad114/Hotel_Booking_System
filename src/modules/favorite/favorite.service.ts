import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FavoriteRepository, HotelRepository } from 'src/common';
import { IUser } from 'src/common/interfaces';

@Injectable()
export class FavoriteServices {
  constructor(
    private readonly favoriteRepo: FavoriteRepository,
    private readonly hotelRepo: HotelRepository,
  ) {}

  addFavorite = async (hotelId: number, user: IUser) => {
    if (!hotelId) throw new BadRequestException('hotel id is required');
    const hotel = await this.hotelRepo.findOne(
      { id: hotelId },
      { select: { code: true, name: true } },
    );
    if (!hotel) throw new NotFoundException('hotel not found');
    const existing = await this.favoriteRepo.findOne({
      hotelId,
      userId: user.id,
    });
    if (existing)
      throw new BadRequestException('favorite already exists for this hotel');
    const favorite = await this.favoriteRepo.create({
      hotel: { connect: { id: hotelId } },
      user: { connect: { id: user.id } },
    });
    return { message: 'favorite created successfully', data: favorite };
  };
  getFavorites = async (user: IUser) => {
    const favorites = await this.favoriteRepo.findMany(
      {
        userId: user.id,
      },
      {
        select: {
          hotel: { select: { name: true } },
          hotelId: true,
          id: true,
        },
      },
    );
    return { message: 'user favorites', data: favorites };
  };
  removeFavorite = async (hotelId: number, user: IUser) => {
    if (!hotelId) throw new BadRequestException('hotel id is required');
    const favorite = await this.favoriteRepo.findOne({
      hotelId,
      userId: user.id,
    });
    if (!favorite) throw new NotFoundException('hotel not found on favorite');
    await this.favoriteRepo.delete({ id: favorite.id });
    return { message: 'favorite removed successfully' };
  };
}
