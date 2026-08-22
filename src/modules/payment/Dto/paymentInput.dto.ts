import { IsBoolean, IsEnum, IsObject, IsOptional } from 'class-validator';
import {
  CaptureMethod,
  PaymentGateway,
} from 'src/common/enums/paymentGateway.enums';

export class PaymentInput {
  @IsEnum(CaptureMethod)
  @IsOptional()
  capture_method!: CaptureMethod;
  @IsBoolean()
  @IsOptional()
  off_session!: boolean;
  @IsObject()
  @IsOptional()
  amountDetails?: Record<string, any>;
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
  @IsEnum(PaymentGateway)
  gateway!: PaymentGateway;
}
