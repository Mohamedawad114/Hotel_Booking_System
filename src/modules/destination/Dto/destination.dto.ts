import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IDestination } from 'src/common/interfaces';

export class DestinationDto implements IDestination {
  @ApiProperty({ example: 'Paris', description: 'Destination name' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'FR', description: 'Two-letter country code' })
  @IsNotEmpty()
  @IsString()
  countryCode!: string;

  @ApiProperty({ example: 'PAR', description: 'Destination code' })
  @IsNotEmpty()
  @IsString()
  code!: string;
}
