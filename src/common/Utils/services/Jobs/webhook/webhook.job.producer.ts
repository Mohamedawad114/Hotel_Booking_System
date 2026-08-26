import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class WebhookProducer {
  constructor(
    @InjectQueue('webhookQueue') private readonly webhookQueue: Queue,
  ) {}
  async addWebhookJob(bookingId: number, userId: number) {
    await this.webhookQueue.add('webhookQueue', {
      bookingId,
      userId,
    });
  }
}
