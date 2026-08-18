import { Field, InputType, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';



@InputType()
export class HoldDto {
  @ApiProperty({ example: 'John', description: 'First name of booking holder' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  firstName!: string;
  @ApiProperty({ example: 'Doe', description: 'Last name of booking holder' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  lastName!: string;
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsNotEmpty()
  @Field(() => String)
  email!: string;
  @ApiProperty({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @Length(10, 15)
  @Field(() => String)
  phone!: string;
}

@InputType()
export class RoomGuestsDto {
  @ApiProperty({ type: () => [GuestDto], description: 'Guests in this room' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestDto)
  @Field(() => [GuestDto])
  guests!: GuestDto[];
}

@InputType()
export class GuestDto {
  @ApiProperty({ example: 'Alice', description: 'Guest first name' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  firstName!: string;
  @ApiProperty({ example: 'Smith', description: 'Guest last name' })
  @IsString()
  @IsNotEmpty()
  @Field(() => String)
  lastName!: string;
  @ApiProperty({ example: 30, required: false, description: 'Guest age' })
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  age?: number;
}
@InputType()
export class BookingInput {
  @ApiProperty({ type: () => [RoomGuestsDto], description: 'Rooms to book' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomGuestsDto)
  @Field(() => [RoomGuestsDto])
  rooms!: RoomGuestsDto[];
  @ApiProperty({ type: () => HoldDto, description: 'Booking contact holder' })
  @ValidateNested({ each: true })
  @Type(() => HoldDto)
  @Field(() => HoldDto)
  holder!: HoldDto;
}
