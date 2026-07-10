import { IsNotEmpty, IsString } from 'class-validator';
import { IDestination } from 'src/common/interfaces';

export class DestinationDto implements IDestination {
  @IsNotEmpty()
  @IsString()
  name!: string;
  @IsNotEmpty()
  @IsString()
  countryCode!: string;
  @IsNotEmpty()
  @IsString()
  code!: string;
}
