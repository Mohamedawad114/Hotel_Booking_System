import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from 'src/modules/AI/ai.module';
import { AIChatProducer } from './AI.job.producer';
import { AIChatProcessor } from './AI.job.processor';
import {
  ConversionRepository,
  MessageRepository,
} from 'src/common/Repositories';
import { conversationModel, messageModel } from 'src/common/models';

@Module({
  imports: [
    AiModule,
    BullModule.registerQueue({
      name: 'AIChat',
    }),
    messageModel,
    conversationModel,
  ],
  providers: [
    AIChatProducer,
    AIChatProcessor,
    MessageRepository,
    ConversionRepository,
  ],
  exports: [AIChatProducer],
})
export class AIJobModule {}
