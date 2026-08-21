import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsInt, IsNotEmpty, IsOptional, Max, Min, ValidateNested } from 'class-validator';

export class ChildAgeDto {
  @IsInt()
  @Min(0)
  @Max(17)
  age!: number;
}
export class SearchAvailabilityDto {
  @ApiProperty({ example: '2026-09-10', description: 'Check-in date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  checkIn!: Date;
  @ApiProperty({ example: '2026-09-15', description: 'Check-out date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  checkOut!: Date;
  @ApiProperty({ example: 1, description: 'Number of children' })
  @IsInt()
  @Type(() => Number)
  children!: number;
  @ApiProperty({ example: 2, description: 'Number of adults' })
  @IsInt()
  @Type(() => Number)
  adults!: number;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildAgeDto)
  childrenAges?: ChildAgeDto[];
}
