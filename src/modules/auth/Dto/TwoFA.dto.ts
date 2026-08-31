import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Length } from 'class-validator';

export class TwoFADto {
  @ApiProperty({ example: 25638, description: '2FA verification code' })
  @IsString()
  @Transform(({ value }) => value?.toString())
  @IsNotEmpty()
  @Length(6)
  code!: string;
  @ApiProperty({ example: 1, description: 'User id for 2FA login' })
  @IsNumber()
  @IsPositive()
  id!: number;
}
