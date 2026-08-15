import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max } from 'class-validator';

export class SearchRoomsDto {
  @ApiPropertyOptional({
    description: 'Number of children',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  children?: number;

  @ApiPropertyOptional({
    description: 'Number of adults',
    example: 2,
  })
  @IsInt()
  @IsOptional()
  adults?: number;

  @ApiPropertyOptional({
    description: 'Room description filter',
    example: 'Sea view',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Room type code',
    example: 'DBL',
  })
  @IsString()
  @IsOptional()
  @Length(1, 3)
  roomsType?: string;

  @ApiPropertyOptional({
    description: 'Pagination cursor',
    example: 'next-page-token',
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results per request',
    example: 20,
    maximum: 100,
  })
  @IsInt()
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
