import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EmailProducer } from './email.producer';
import { EmailWorker } from './email.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { EmailServices } from './mail.service';
import { HashingService } from 'src/common/Utils/Hashing/hash.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'email' }),
    BullBoardModule.forFeature({
      name: 'email',
      adapter: BullMQAdapter,
    }),
    HttpModule,
  ],
  providers: [EmailProducer, EmailWorker, EmailServices, HashingService],
  exports: [EmailProducer],
})
export class EmailModule {}
