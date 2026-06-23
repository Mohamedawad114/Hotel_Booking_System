import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Types } from 'mongoose';
import { Socket } from 'socket.io';

@Injectable()
export class AIChatProducer {
  constructor(@InjectQueue('AIChat') private readonly AIQueue: Queue) {}
  chat = async (
    userId: Types.ObjectId,
    content: string,
    conversationId?: Types.ObjectId,
    chatMessage: any[] = [],
  ) => {
    await this.AIQueue.add(
      'chat',
      {
        userId,
        content,
        conversationId,
        chatMessage,
      },
      {
        attempts: 1,
        removeOnFail: false,
        removeOnComplete: true,
      },
    );
  };
}
