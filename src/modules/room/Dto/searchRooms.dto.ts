import { IsInt, IsOptional, IsString } from 'class-validator';

export class searchRoomsDto {
  @IsInt()
  @IsOptional()
  children?: number;
  @IsInt()
  @IsOptional()
  adults?: number;
  @IsString()
  @IsOptional()
  description?: string;
  @IsInt()
  @IsOptional()
  roomsCount?: number;
}
