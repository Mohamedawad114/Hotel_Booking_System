import { IsNumber, IsOptional, IsString, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDto {
  @ApiPropertyOptional({ description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @Max(100)
  @IsNumber()
  limit?: number;
}
