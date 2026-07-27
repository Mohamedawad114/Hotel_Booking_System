import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
