import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewServices } from './review.service';
import { addReviewDto } from './Dto/addReview.dto';
import { Sys_Role } from 'src/common/enums';
import { Auth, AuthUser } from 'src/common/decorator';
import { type IUser } from 'src/common/interfaces';

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.Admin, Sys_Role.User, Sys_Role.SuperAdmin)
@Controller('reviews')
export class Review_Controller {
  constructor(private readonly reviewServices: ReviewServices) {}

  @HttpCode(200)
  @Get('/:id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiResponse({ status: 200, description: 'Return review data' })
  getReview(@Param('id') reviewId: number) {
    return this.reviewServices.getReview(reviewId);
  }

  @HttpCode(200)
  @Get('/all/:hotelId')
  @ApiOperation({ summary: 'Get reviews for a product with pagination' })
  @ApiResponse({ status: 200, description: 'Return list of reviews' })
  getProductReviews(
    @Param('hotelId') hotelId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewServices.getHotelReviews(hotelId, page, limit);
  }

  @Post('/:hotelId')
  @ApiOperation({ summary: 'Add a review to a product' })
  @ApiResponse({ status: 201, description: 'Review added successfully' })
  addReview(
    @Param('hotelId') hotelId: number,
    @AuthUser() user: IUser,
    @Body() Dto: addReviewDto,
  ) {
    return this.reviewServices.addReview(hotelId, Dto, user);
  }
}
