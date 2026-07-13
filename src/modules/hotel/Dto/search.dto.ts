import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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
