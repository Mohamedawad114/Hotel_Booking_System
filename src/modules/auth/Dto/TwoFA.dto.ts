import { IsNotEmpty, IsNumber, IsPositive, Length } from 'class-validator';

export class TwoFADto {
  @IsNumber()
  @IsNotEmpty()
  @Length(6)
  code!: string;
  @IsNumber()
  @IsPositive()
  id!: number;
}
