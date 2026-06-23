import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProducer } from './email.producer';
import { EmailWorker } from './email.processor';
import { MailModule } from '../../mailService/mail.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' }), MailModule],
  providers: [EmailProducer, EmailWorker],
  exports: [EmailProducer],
})
export class EmailModule {}
