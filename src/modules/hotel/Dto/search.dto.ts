import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchHotelsDto {
  @IsOptional()
  @IsString()
  hotelName?: string;

  @IsOptional()
  destinationCode?: string;
  @IsOptional()
  destinationName?: string;
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;
  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsNumber()
  @IsOptional()
  adults?: number;

  @IsNumber()
  @IsOptional()
  children?: number;
}
