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

export class SearchHotelsDto {
  @IsOptional()
  @IsString()
  hotelName?: string;
  @IsOptional()
  @IsString()
  destinationCode?: string;
  @IsOptional()
  @IsString()
  city?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
  @IsOptional()
  @IsString()
  countryCode?: string;
}

export class SortingHotelsDto {
  @IsOptional()
  @IsEnum(order)
  ranking?: order;
  @IsOptional()
  @IsEnum(order)
  rating?: order;
}
