import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
 type RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import type { IUser } from 'src/common/interfaces';
import  { Request } from 'express';
import { PaymentInput } from './Dto/paymentInput.dto';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Auth(Sys_Role.Admin, Sys_Role.User)
  @Post(':bookingId/pay')
  @HttpCode(200)
  @ApiOperation({ summary: 'Initialize payment for a pending booking' })
  @ApiParam({
    name: 'bookingId',
    type: Number,
    description: 'ID of the pending booking to pay for',
  })
  @ApiBody({ type: PaymentInput })
  @ApiResponse({
    status: 200,
    description: 'Payment initialized successfully',
    schema: {
      example: {
        message: 'Payment initialized successfully',
        data: {
          clientSecret: 'pi_client_secret',
          id: 'pi_123456789',
          bookingId: 1,
        },
        meta: { gateway: 'stripe' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data or gateway' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'Booking not found or confirmed' })
  async pay(
    @AuthUser() user: IUser,
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body() data: PaymentInput,
  ) {
    return await this.paymentService.pay(user, bookingId, data);
  }
  @Post('stripe')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    return await this.paymentService.webhook(req);
  }
}
