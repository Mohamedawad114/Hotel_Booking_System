import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class EmailProducer {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}
  sendEmailJob = async (
    type: string,
    to: string,
  ) => {
    await this.emailQueue.add(
      type,
      {
        to,
      },
      {
        attempts: 3,
        removeOnFail: false,
        removeOnComplete: true,
      },
    );
  };
}
