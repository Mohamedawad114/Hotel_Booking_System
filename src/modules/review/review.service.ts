import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HotelRepository, ReviewRepository } from 'src/common';
import { addReviewDto } from './Dto/addReview.dto';
import { IUser } from 'src/common/interfaces';

@Injectable()
export class ReviewServices {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly hotelRepo: HotelRepository,
  ) {}
  addReview = async (hotelId: number, data: addReviewDto, user: IUser) => {
    if (!hotelId) throw new BadRequestException('hotel id is required');
    const hotel = await this.hotelRepo.findOne(
      { id: hotelId },
      { select: { code: true, name: true } },
    );
    if (!hotel) throw new NotFoundException('hotel not found');
    const review = await this.reviewRepo.create({
      ...data,
      hotel: { connect: { id: hotelId } },
      user: { connect: { id: user.id } },
    });
    return { message: 'review created successfully', data: review };
  };
  getReview = async (reviewId: number) => {
    if (!reviewId) throw new BadRequestException('review id is required');
    const review = await this.reviewRepo.findOne(
      { id: reviewId },
      {
        select: {
          user: { select: { name: true, id: true } },
          rating: true,
          comment: true,
          id: true,
        },
      },
    );
    if (!review) throw new NotFoundException('review not found');
    return { message: 'review rev successfully', data: review };
  };
  getHotelReviews = async (hotelId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    if (!hotelId) throw new BadRequestException('hotel id is required');
    const hotel = await this.hotelRepo.findOne(
      { id: hotelId },
      { select: { code: true, name: true } },
    );
    if (!hotel) throw new NotFoundException('hotel not found');
    const review = await this.reviewRepo.findMany(
      {
        hotelId,
      },
      {
        select: {
          user: { select: { name: true, id: true } },
          rating: true,
          comment: true,
          id: true,
        },
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
        skip: offset,
      },
    );
    return { message: 'review created successfully', data: review };
  };
}
