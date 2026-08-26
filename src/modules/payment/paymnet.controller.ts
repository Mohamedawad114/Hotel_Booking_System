import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import type { IUser } from 'src/common/interfaces';
import { Request } from 'express';
import { PaymentInput } from './Dto/paymentInput.dto';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@ApiBearerAuth('access-token')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Auth(Sys_Role.Admin, Sys_Role.User)
  @Get('gateways')
  @ApiOperation({ summary: 'Get available payment gateways' })
  @ApiResponse({ status: 200, description: 'Available payment gateways' })
  getPaymentGateways() {
    return this.paymentService.getPaymentGateway();
  }
  @Auth(Sys_Role.Admin, Sys_Role.User)
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get my payments' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Payments fetched successfully' })
  async getMyPayments(
    @AuthUser() user: IUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return await this.paymentService.getMyPayments(user, page, limit);
  }

  @Auth(Sys_Role.Admin, Sys_Role.User)
  @Get(':paymentId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get payment details by ID' })
  @ApiParam({ name: 'paymentId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Payment details fetched successfully',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentDetails(
    @AuthUser() user: IUser,
    @Param('paymentId', ParseIntPipe) paymentId: number,
  ) {
    return await this.paymentService.getPaymentDetails(user, paymentId);
  }

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

  @Auth(Sys_Role.Admin)
  @Post(':bookingId/refund')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refund a confirmed booking payment' })
  @ApiParam({ name: 'bookingId', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { amount: { type: 'number', example: 1500 } },
      required: ['amount'],
    },
  })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async refund(
    @Param('bookingId', ParseIntPipe) bookingId: number,
    @Body('amount') amount: number,
  ) {
    return await this.paymentService.refund(bookingId, amount);
  }
  @Post('stripe')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>) {
    return await this.paymentService.webhook(req);
  }


}
