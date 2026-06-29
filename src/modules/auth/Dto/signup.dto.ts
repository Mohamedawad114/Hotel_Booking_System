import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 40)
  name!: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
  @IsString()
  @Length(8, 100)
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  password!: string;
  @IsString()
  @IsNotEmpty()
  city!: string;
  @IsString()
  @IsNotEmpty()
  @Length(12, 100)
  street!: string;
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  phone!: string;
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date_birth!: Date;
}
