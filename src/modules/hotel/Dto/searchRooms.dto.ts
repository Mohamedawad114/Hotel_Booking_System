import { IsInt, IsOptional } from 'class-validator';

export class searchRoomsDto {
  @IsInt()
  @IsOptional()
  children?: number;
  @IsInt()
  @IsOptional()
  adults?: number;

  @IsInt()
  @IsOptional()
  roomsCount?: number;
}
