import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { order } from 'src/common/enums';
import { QueryDto } from './query.dto';

export class SearchHotelsDto {
  @ApiPropertyOptional({
    description: 'Hotel name filter',
    example: 'Ocean View Hotel',
  })
  @IsOptional()
  @IsString()
  hotelName?: string;

  @ApiPropertyOptional({
    description: 'Destination code filter',
    example: 'PAR',
  })
  @IsOptional()
  @IsString()
  destinationCode?: string;

  @ApiPropertyOptional({
    description: 'City filter',
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Minimum hotel star rating',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  stars?: number;

  @ApiPropertyOptional({
    description: 'Country code filter',
    example: 'FR',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class SortingHotelsDto {
  @ApiPropertyOptional({
    description: 'Sorting direction for ranking',
    enum: order,
    example: order.asc,
  })
  @IsOptional()
  @IsEnum(order)
  ranking?: order;

  @ApiPropertyOptional({
    description: 'Sorting direction for rating',
    enum: order,
    example: order.desc,
  })
  @IsOptional()
  @IsEnum(order)
  rating?: order;
}

export class SearchHotelsQueryDto extends IntersectionType(
  QueryDto,
  SearchHotelsDto,
  SortingHotelsDto,
) {}
