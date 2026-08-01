import { IsInt, IsOptional, IsString, Length } from 'class-validator';

export class SearchRoomsDto {
  @IsInt()
  @IsOptional()
  children?: number;
  @IsInt()
  @IsOptional()
  adults?: number;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString()
  @IsOptional()
  @Length(1, 3)
  roomsType?: string;
}
