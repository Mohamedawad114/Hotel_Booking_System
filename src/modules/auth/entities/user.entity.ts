import { Exclude, Expose } from 'class-transformer';
import { IsDate, IsEmail, IsString } from 'class-validator';
import { Sys_Role } from 'src/common/enums';

@Exclude()
export class userCreateEntity {
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
  photo!: string;
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
}
