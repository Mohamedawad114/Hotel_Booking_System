import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsOptional } from 'class-validator';

export class searchRoomsDto {
  @IsInt()
  @IsOptional()
  children?: number;
  @IsInt()
  @IsOptional()
  audit?: number;
  @IsDate()
  @Type(() => Number)
  @IsOptional()
  checkIn?: Date;
  @IsDate()
  @Type(() => Number)
  @IsOptional()
  checkOut?: Date;
  @IsInt()
  @IsOptional()
  roomsCount?: number;
}
