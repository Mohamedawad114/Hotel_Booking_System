import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IReview } from 'src/common/interfaces';

export class addReviewDto implements IReview {
  @ApiProperty({
    example: 5,
    description: 'Rating stars from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Max(5)
  @Min(1)
  rating!: number;

  @ApiPropertyOptional({
    example: 'Great product, really loved it!',
    description: 'Optional review content or comment',
    minLength: 4,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @Length(4, 100)
  comment!: string;
}
