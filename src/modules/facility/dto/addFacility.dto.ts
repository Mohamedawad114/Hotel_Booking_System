import { IsInt, IsString } from 'class-validator';

export class AddFacility {
  @IsString()
  name!: string;
  @IsInt()
  code!: number;
  @IsInt()
  groupCode!: number;
}
