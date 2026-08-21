import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Res,
  Req,
  HttpCode,
  Put,
  Query,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { type IUser } from 'src/common/interfaces';
import { Auth, AuthUser } from 'src/common/decorator';
import { ResetPasswordDto, UpdatePasswordDto, UpdateProfileDto } from './Dto';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Sys_Role } from 'src/common/enums';
import { ProfileService } from './profile.service';
import { Throttle } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Auth(Sys_Role.User, Sys_Role.Admin, Sys_Role.SuperAdmin)
@ApiTags('profile')
@ApiBearerAuth('access-token')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileServices: ProfileService) {}

  @Post('photo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({}),
    }),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @AuthUser() user: IUser,
  ) {
    return this.profileServices.uploadPhoto(user, file);
  }
  @Get('')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async Profile(@AuthUser() user: IUser) {
    return await this.profileServices.getProfile(user);
  }
  @Get('reset-passwordReq')
  @ApiOperation({ summary: 'Request password reset OTP' })
  async resetPasswordReq(@Query('email') email: string) {
    return await this.profileServices.resetPasswordReq(email);
  }

  @Get('resend-OTP-reset')
  @ApiOperation({ summary: 'Resend reset password OTP' })
  async resendOTP_reset(@Query('email') email: string) {
    return await this.profileServices.resendOTP_reset(email);
  }
  @Get('setup-2fa')
  @ApiOperation({ summary: 'setup 2fa' })
  async enable2FA(@AuthUser() user: IUser) {
    return await this.profileServices.setup2FA(user);
  }
  @Put('update-profile')
  @ApiOperation({ summary: 'Update profile data' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'profile updated successfully' })
  @ApiBadRequestResponse({ description: 'invalid data' })
  async updateProfile(@AuthUser() user: IUser, @Body() dto: UpdateProfileDto) {
    return await this.profileServices.updateProfile(user, dto);
  }
  @Patch('update-password')
  @ApiOperation({ summary: 'Update current password' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiBadRequestResponse({ description: 'invalid old Password' })
  async updatePassword(
    @AuthUser() user: IUser,
    @Body() dto: UpdatePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.profileServices.updatePassword(dto, user, res);
  }
  @Patch('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirm password reset with OTP & delete refresh token',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid OTP or OTP expired' })
  async resetPassword(
    @Query('email') email: string,
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.profileServices.resetPasswordConfirm(email, dto, res);
  }
  @Patch('/enable-2fa')
  @Throttle({ verifyTwoFA: { ttl: 60, limit: 12 } })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          example: 25638,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: '2FA is enabled successfully' })
  @ApiBadRequestResponse({ description: 'Invalid code or code expired' })
  async verify2FA(@AuthUser() user: IUser, @Body('code') code: string) {
    return await this.profileServices.verifySetup2FA(user, code);
  }

  //   @Patch('update-profile-picture')
  //   @HttpCode(200)
  //   @ApiOperation({ summary: 'Update profile picture' })
  //   @ApiBody({ type: UpdateUploadDto })
  //   async updateUpload(@AuthUser() user: IUser, @Body() dto: UpdateUploadDto) {
  //     return await this.profileServices.updateUpload(dto, user);
  //   }

  @Delete('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout from current device' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.profileServices.logout(req, res);
  }
  @Delete('logoutAll')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAllDevices(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.profileServices.logoutAllDevices(req, res);
  }
}
