import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ConfirmEmailDto, LoginDto, ResendOTPDto, SignupDto } from './Dto';
import { TwoFADto } from './Dto/TwoFA.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create new account with email & password & phone' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'signup successfully' })
  @ApiResponse({ status: 404, description: 'company not found' })
  @ApiResponse({ status: 400, description: 'validation error' })
  signup(@Body() data: SignupDto) {
    return this.authServices.SignUp(data);
  }
  @HttpCode(200)
  @Post('login')
  @Throttle({ login: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    schema: { example: { access_token: 'string' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authServices.loginUser(dto, res);
  }
  @Throttle({ twoFAlogin: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Login with 2fa' })
  @ApiResponse({
    status: 200,
    description: 'Login successfully',
    schema: { example: { access_token: 'string' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async twoFAlogin(
    @Body() dto: TwoFADto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authServices.TwoFAlogin(dto, res);
  }
  @HttpCode(200)
  @Post('confirm-email')
  @ApiOperation({ summary: 'Confirm user email using OTP' })
  @ApiBody({ type: ConfirmEmailDto })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  async confirmEmail(@Body() dto: ConfirmEmailDto) {
    return await this.authServices.ConfirmEmail(dto);
  }
  @HttpCode(200)
  @Get('resend-OTP')
  @ApiOperation({ summary: 'Resend OTP to user email' })
  @ApiQuery({ type: ResendOTPDto })
  @ApiResponse({ status: 200, description: 'OTP send' })
  async resendOTP(@Query() dto: ResendOTPDto) {
    return await this.authServices.resendOTP(dto);
  }
  @HttpCode(200)
  @Get('refresh-token')
  @ApiOperation({
    summary:
      'Refresh access token using refresh token & delete old refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: { example: { access_token: 'string' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authServices.refreshToken(req, res);
  }
}
