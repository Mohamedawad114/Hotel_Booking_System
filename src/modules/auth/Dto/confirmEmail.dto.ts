import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class ConfirmEmailDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  @Length(6)
  OTP!: string;
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;
}
export class ResendOTPDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;
}
