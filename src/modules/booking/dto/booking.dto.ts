import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class BookingDto {
  @ApiProperty({ type: () => [RoomGuestsDto], description: 'Rooms to book' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomGuestsDto)
  rooms!: RoomGuestsDto[];

  @ApiProperty({ type: () => HoldDto, description: 'Booking contact holder' })
  @ValidateNested()
  @Type(() => HoldDto)
  holder!: HoldDto;
}

export class HoldDto {
  @ApiProperty({ example: 'John', description: 'First name of booking holder' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of booking holder' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @Length(10, 15)
  phone!: string;
}

export class RoomGuestsDto {
  @ApiProperty({ type: () => [GuestDto], description: 'Guests in this room' })
  @IsArray()
  @ValidateNested({ each: true })
  guests!: GuestDto[];
}

export class GuestDto {
  @ApiProperty({ example: 'Alice', description: 'Guest first name' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Smith', description: 'Guest last name' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ example: 30, required: false, description: 'Guest age' })
  @IsOptional()
  @IsNumber()
  age?: number;
}
