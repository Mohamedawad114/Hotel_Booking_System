import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { Gateway } from './gateway';

@Module({
  imports: [NotificationModule],
  providers: [Gateway],
})
export class GatewayModule {}
