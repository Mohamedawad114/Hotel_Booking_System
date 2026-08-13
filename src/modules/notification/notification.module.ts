import { Module } from '@nestjs/common';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { notificationModel } from 'src/common/DB';

@Module({
  imports: [notificationModel],
  providers: [NotificationService, NotificationRepository],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
