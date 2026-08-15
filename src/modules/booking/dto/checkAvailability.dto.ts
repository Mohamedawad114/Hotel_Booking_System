import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt } from 'class-validator';

export class SearchAvailabilityDto {
  @ApiProperty({ example: '2026-09-10', description: 'Check-in date' })
  @IsDate()
  @Type(() => Date)
  checkIn!: Date;

  @ApiProperty({ example: '2026-09-15', description: 'Check-out date' })
  @IsDate()
  @Type(() => Date)
  checkOut!: Date;

  @ApiProperty({ example: 1, description: 'Number of children' })
  @IsInt()
  children!: number;

  @ApiProperty({ example: 2, description: 'Number of adults' })
  @IsInt()
  adults!: number;
}
