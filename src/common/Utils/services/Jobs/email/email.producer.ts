import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ICreatedBookingEmail } from 'src/common/interfaces/email.interface';

@Injectable()
export class EmailProducer {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}
  sendEmailJob = async (
    type: string,
    to: string,
    bookingNumber?: string,
    data?: ICreatedBookingEmail,
  ) => {
    await this.emailQueue.add(
      type,
      {
        to,
        data,
        bookingNumber,
      },
      {
        attempts: 3,
        delay: 2000,
        removeOnFail: false,
        removeOnComplete: true,
      },
    );
  };
}
