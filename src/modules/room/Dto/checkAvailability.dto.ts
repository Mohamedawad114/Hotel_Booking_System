import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class SearchAvailabilityDto {
  @IsDate()
  @Type(() => Date)
  checkIn!: Date;
  @IsDate()
  @Type(() => Date)
  checkOut!: Date;
    @IsInt()
    children!: number;
    @IsInt()
    adults!: number;
}
