import { IsBoolean, IsEnum, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CaptureMethod,
  PaymentGateway,
} from 'src/common/enums/paymentGateway.enums';

export class PaymentInput {
  @ApiPropertyOptional({
    enum: CaptureMethod,
    description: 'Stripe payment capture method',
    example: CaptureMethod.AUTOMATIC,
  })
  @IsEnum(CaptureMethod)
  @IsOptional()
  capture_method!: CaptureMethod;

  @ApiPropertyOptional({
    description: 'Indicates whether the payment is an off-session setup',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  off_session!: boolean;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Detailed amount metadata from the gateway',
    additionalProperties: true,
    example: { subtotal: 1200, tax: 100 },
  })
  @IsObject()
  @IsOptional()
  amountDetails?: Record<string, any>;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Extra metadata to send to the payment gateway',
    additionalProperties: true,
    example: { bookingId: 12, source: 'web' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    enum: PaymentGateway,
    description: 'Selected payment gateway',
    example: PaymentGateway.stripe,
  })
  @IsEnum(PaymentGateway)
  gateway!: PaymentGateway;
}
