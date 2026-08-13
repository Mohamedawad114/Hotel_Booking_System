import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Auth, AuthUser } from 'src/common/decorator';
import { Sys_Role } from 'src/common/enums';
import {type IUser } from 'src/common/interfaces';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Auth(Sys_Role.Admin, Sys_Role.User, Sys_Role.SuperAdmin)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get current user notifications (cursor pagination)',
  })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Notifications fetched successfully',
  })
  async getNotifications(
    @AuthUser() user: IUser,
    @Query('cursor') cursor?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return await this.notificationService.getNotifications(user, cursor, limit);
  }
}
