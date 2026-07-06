import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsMatch } from 'src/common/decorator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'A1B2C3',
    description: '6-character verification code',
  })
  @IsAlphanumeric()
  @Length(6, 6)
  @IsNotEmpty()
  OTP!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  newPassword!: string;

  @ApiProperty({ example: 'NewP@ssword1', description: 'Confirm new password' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsMatch(['newPassword'])
  confirmPassword!: string;
}
