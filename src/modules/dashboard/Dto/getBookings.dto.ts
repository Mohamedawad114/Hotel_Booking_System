import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetBookingsDto {
  @IsString()
  @IsOptional()
  cursor?: string;
  @IsInt()
  @Max(100)
  @Min(1)
  @IsOptional()
  limit?: number | string;
  @IsString()
  @IsOptional()
  day?: string;
  @IsString()
  @IsOptional()
  month?: string;
}
