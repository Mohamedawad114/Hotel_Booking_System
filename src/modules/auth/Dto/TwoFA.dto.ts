import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Length } from 'class-validator';

export class TwoFADto {
  @ApiProperty({ example: 25638, description: '2FA verification code' })
  @IsNumber()
  @IsNotEmpty()
  @Length(6)
  code!: string;
  @ApiProperty({ example: 1, description: 'User id for 2FA login' })
  @IsNumber()
  @IsPositive()
  id!: number;
}
