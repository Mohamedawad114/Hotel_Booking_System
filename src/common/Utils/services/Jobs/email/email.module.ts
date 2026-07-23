import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProducer } from './email.producer';
import { EmailWorker } from './email.processor';
import { MailModule } from '../../mailService/mail.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'email' }),
    BullBoardModule.forFeature({
      name: 'email',
      adapter: BullMQAdapter,
    }),
    MailModule,
  ],
  providers: [EmailProducer, EmailWorker],
  exports: [EmailProducer],
})
export class EmailModule {}
