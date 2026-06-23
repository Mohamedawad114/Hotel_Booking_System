import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import {
  ConversionRepository,
  MessageRepository,
} from 'src/common/Repositories';
import { AIServices } from 'src/modules/AI/ai.service';
import { sender } from 'src/common/Enum';
import { redis, redisKeys, redisPub } from '../../redis';
import { Types } from 'mongoose';

@Processor('AIChat', {
  limiter: {
    max: 2,
    duration: 30000,
  },
})
export class AIChatProcessor extends WorkerHost {
  constructor(
    private readonly messageRepo: MessageRepository,
    private readonly conversationRepo: ConversionRepository,
    private readonly aiServices: AIServices,
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  async process(job: Job) {
    const { userId, content, conversationId, chatMessage } = job.data;
    let convId = new Types.ObjectId(conversationId);
    let isNew = false;
    if (!conversationId) {
      const name = await this.aiServices.generateConversationName(content);
      const conversation = await this.conversationRepo.create({
        conversationName: name,
        userId: new Types.ObjectId(userId),
      });
      await redisPub.publish(
        'conversationName',
        JSON.stringify({
          conversationName: conversation.conversationName,
          conversationId: conversation._id,
          userId: userId,
        }),
      );
      convId = new Types.ObjectId(conversation._id);
      await this.messageRepo.create({
        conversationId: convId,
        sendBy: sender.user,
        content,
      });
      isNew = true;
    }
    const messages = [
      ...chatMessage,
      {
        role: 'user',
        content: content,
      },
    ];
    const fullReply = await this.aiServices.generateStream(
      messages,
      async (chunk) => {
        await redisPub.publish(
          'chat-chunk',
          JSON.stringify({ conversationId: convId, userId, chunk, isNew }),
        );
      },
    );

    await this.messageRepo.create({
      conversationId: convId,
      sendBy: sender.assistant,
      content: fullReply,
    });
    await redis.del(redisKeys.chatHistory(convId.toString()));
    await redisPub.publish(
      'reply-done',
      JSON.stringify({ userId, conversationId: convId, fullReply, isNew }),
    );
  }

  @OnWorkerEvent('completed')
  handleCompleted(job: Job) {
    this.logger.info({ jobId: job.id }, 'Job completed successfully');
  }

  @OnWorkerEvent('failed')
  handleFailed(job: Job, err: Error) {
    this.logger.error(
      { jobId: job.id, err, message: err?.message, stack: err?.stack },
      'Job failed',
    );
  }
}
