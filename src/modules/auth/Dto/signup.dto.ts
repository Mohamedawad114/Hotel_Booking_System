import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 40)
  name!: string;
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email!: string;
  @ApiProperty({
    example: 'StrongP@ssword1',
    description: 'Password with uppercase, lowercase, number, and symbol',
  })
  @IsString()
  @Length(8, 100)
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  password!: string;
  @ApiProperty({ example: 'New York', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city!: string;
  @ApiProperty({ example: '123 Main Street', description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  @Length(12, 100)
  street!: string;
  @ApiProperty({ example: '+12345678901', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  phone!: string;
  @ApiProperty({
    example: '1990-01-01T00:00:00.000Z',
    description: 'Date of birth',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date_birth!: Date;
}
