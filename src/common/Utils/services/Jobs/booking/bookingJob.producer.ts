import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
@Injectable()
export class BookingJobProducer {
  constructor(@InjectQueue('booking') private readonly bookingQueue: Queue) {}
  async addBookingJob(userId: number, bookingId: number) {
    await this.bookingQueue.add(
      'booking',
      {
        userId,
        bookingId,
      },
      {
        delay: 1000 * 60 * 15,
      },
    );
  }
}
