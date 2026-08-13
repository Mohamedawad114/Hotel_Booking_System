import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { IUser } from 'src/common/interfaces';
@Injectable()
export class BookingJobProducer {
  constructor(@InjectQueue('booking') private readonly bookingQueue: Queue) {}
  async addBookingJob(user: IUser,hotelName:string ,bookingId: number) {
    await this.bookingQueue.add(
      'booking',
      {
        user,
        hotelName,
        bookingId,
      },
      {
        delay: 1000 * 60 * 15,
      },
    );
  }
}
