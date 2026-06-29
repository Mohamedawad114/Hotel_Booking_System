import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { IUser } from 'src/common/interfaces';
export class UpdateProfileDto implements Partial<IUser> {
  @IsString()
  @IsOptional()
  @Length(3, 40)
  name?: string;
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;
  @IsString()
  @IsOptional()
  city?: string;
  @IsString()
  @IsOptional()
  @Length(12, 100)
  street?: string;
  @IsString()
  @IsOptional()
  @Length(10, 15)
  phone?: string;
}
