import { IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryDto {
  @IsString()
  @IsOptional()
  cursor?: string;
  @IsOptional()
  @IsNumber()
  limit?: number;
}
