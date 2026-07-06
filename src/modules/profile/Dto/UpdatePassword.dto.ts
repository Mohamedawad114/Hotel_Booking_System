import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { IsMatch } from 'src/common/decorator';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'OldP@ssword1', description: 'Current password' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?.&-])[A-Za-z\d@$!%?.&-]{8,}$/,
  )
  oldPassword!: string;
  @ApiProperty({ example: 'NewP@ssword1', description: 'New password' })
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
  confirmNewPassword!: string;
}
