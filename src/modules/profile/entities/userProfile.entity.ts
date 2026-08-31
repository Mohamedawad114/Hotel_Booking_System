import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsString } from 'class-validator';
import { Sys_Role } from 'src/common/enums';

@Exclude()
export class userProfileEntity {
  @IsString()
  @Expose()
  name!: string;
  @IsString()
  @IsEmail()
  @Expose()
  email!: string;
  @IsString()
  @Expose()
  role!: Sys_Role;
  @IsString()
  @Expose()
  photoUrl!: string;
  @IsString()
  @Expose()
  photoId!: string;
  @IsString()
  @Expose()
  city!: string;
  @IsString()
  @Expose()
  street!: string;
  @IsString()
  @Expose()
  phone!: string;
  @Expose()
  @IsDate()
  date_birth!: Date;
  @IsBoolean()
  @Expose()
  isConfirmed!: boolean;
  @IsBoolean()
  @Expose()
  isTwoFA!: boolean;
}
