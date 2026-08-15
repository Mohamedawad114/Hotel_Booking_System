import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class AddFacility {
  @ApiProperty({ example: 'Wi-Fi', description: 'Facility name' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 101, description: 'Facility code' })
  @IsInt()
  code!: number;

  @ApiProperty({ example: 2, description: 'Facility group code' })
  @IsInt()
  groupCode!: number;
}
