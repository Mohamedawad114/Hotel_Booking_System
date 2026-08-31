import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryDto {
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
  @IsString()
  @Min(1)
  @Max(100)
  @IsOptional()
  cursor?: string;
}
