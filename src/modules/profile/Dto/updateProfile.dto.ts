import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { IUser } from 'src/common/interfaces';
export class UpdateProfileDto implements Partial<IUser> {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsOptional()
  @Length(3, 40)
  name?: string;
  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;
  @ApiPropertyOptional({ example: 'New York', description: 'City name' })
  @IsString()
  @IsOptional()
  city?: string;
  @ApiPropertyOptional({
    example: '123 Main Street',
    description: 'Street address',
  })
  @IsString()
  @IsOptional()
  @Length(12, 100)
  street?: string;
  @ApiPropertyOptional({ example: '+12345678901', description: 'Phone number' })
  @IsString()
  @IsOptional()
  @Length(10, 15)
  phone?: string;
}
