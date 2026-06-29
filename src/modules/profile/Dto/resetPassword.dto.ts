import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsMatch } from 'src/common/decorator';

export class ResetPasswordDto {
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

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  @IsMatch(['newPassword'])
  confirmPassword!: string;
}
