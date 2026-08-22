import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsObject,
  Min,
} from 'class-validator';
import { CaptureMethod } from 'src/common/enums/paymentGateway.enums';



export class StripeInput {
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsInt()
  @IsNotEmpty()
  userId!: number;

  @IsInt()
  @IsNotEmpty()
  bookingId!: number;

  @IsString()
  @IsOptional()
  customerId?: string;
  @IsEnum(CaptureMethod)
  @IsOptional()
  captureMethod?: CaptureMethod;
  @IsBoolean()
  @IsOptional()
  offSession?: boolean;
  @IsObject()
  @IsOptional()
  amountDetails?: Record<string, any>;
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
