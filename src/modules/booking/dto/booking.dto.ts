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
  rooms!: RoomGuestsDto[];
  holder!: HoldDto;
}
class HoldDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;
  @IsString()
  @IsNotEmpty()
  lastName!: string;
  @IsEmail()
  @IsNotEmpty()
  email!: string;
  @IsString()
  @Length(10, 15)
  phone!: string;
}
class RoomGuestsDto {
  @IsArray()
  @ValidateNested({ each: true })
  guests!: GuestDto[];
}
class GuestDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;
  @IsString()
  @IsNotEmpty()
  lastName!: string;
  @IsOptional()
  @IsNumber()
  age?: number;
}
