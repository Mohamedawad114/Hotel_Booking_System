import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  IsEnum,
  IsInt,
} from 'class-validator';
import { order } from 'src/common/enums';
import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Type } from 'class-transformer';

registerEnumType(order, { name: 'order' });
@ArgsType()
export class SearchArgs {
  @ApiPropertyOptional({
    description: 'Hotel name filter',
    example: 'Ocean View Hotel',
  })
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  hotelName?: string;
  @ApiPropertyOptional({
    description: 'Destination code filter',
    example: 'PAR',
  })
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  destinationCode?: string;
  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({
    description: 'City filter',
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  city?: string;
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  stars?: number;
  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({
    description: 'Country code filter',
    example: 'FR',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
  @Field(() => order, { nullable: true })
  @ApiPropertyOptional({
    description: 'Sorting direction for rating',
    enum: order,
    example: order.desc,
  })
  @IsOptional()
  @IsEnum(order)
  rating?: order;
  @Field(() => order, { nullable: true })
  @ApiPropertyOptional({
    description: 'Sorting direction for ranking',
    enum: order,
    example: order.asc,
  })
  @IsOptional()
  @IsEnum(order)
  ranking?: order;
  @Field(() => String, { nullable: true })
  @ApiPropertyOptional({ description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;
  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
  })
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @Type(() => Number)
  @Max(100)
  @IsNumber()
  @Min(1)
  limit?: number;
}
