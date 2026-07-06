import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({
    example: 'A1B2C3',
    description: '6-character verification code',
  })
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(6)
  OTP!: string;
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;
}
export class ResendOTPDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;
}
