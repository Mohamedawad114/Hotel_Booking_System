import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { Gateway } from './gateway';

@Module({
  imports: [NotificationModule],
  providers: [Gateway],
  exports: [Gateway],
})
export class GatewayModule {}
