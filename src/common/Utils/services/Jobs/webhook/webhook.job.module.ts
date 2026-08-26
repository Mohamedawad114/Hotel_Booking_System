import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { WebhookProducer } from './webhook.job.producer';
import { BookingRepository } from 'src/common/repositories/prisma repositories';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'webhookQueue' }),
    BullBoardModule.forFeature({
      name: 'webhookQueue',
      adapter: BullMQAdapter,
    }),
    EmailModule,
  ],
  providers: [WebhookProducer, BookingRepository],
  exports: [WebhookProducer],
})
export class WebhookJobModule {}
