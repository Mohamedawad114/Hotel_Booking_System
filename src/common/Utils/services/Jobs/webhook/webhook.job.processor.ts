import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { EmailProducer } from '../email/email.producer';
import { PinoLogger } from 'nestjs-pino';
import { Job } from 'bullmq';
import {
  BookingRepository,
  UserRepository,
} from 'src/common/repositories/prisma repositories';
import { emailType } from 'src/common/enums';
import { redis, redisKeys } from '../../redis';

@Processor({ name: 'webhookQueue' })
export class WebhookProcessor extends WorkerHost {
  constructor(
    private readonly emailQueue: EmailProducer,
    private readonly userRepo: UserRepository,
    private readonly bookingRepo: BookingRepository,
    private readonly logger: PinoLogger,
  ) {
    super();
  }
  async process(job: Job) {
    const { userId, bookingId } = job.data;
    const user = await this.userRepo.findById(userId, {
      select: { name: true, email: true },
    });
    const booking = await this.bookingRepo.findById(bookingId, {
      select: {
        payment: { select: { paymentId: true } },
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        bookingNumber: true,
      },
    });
    const hotelName = await redis.get(redisKeys.hotelName(booking.id));
    await this.emailQueue.sendEmailJob(emailType.confirmedBooking, user.email, {
      name: user.hotelName,
      totalPrice: booking.totalprice,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      paymentId: booking.payment.paymentId,
      hotelName: hotelName!,
      bookingNumber: booking.bookingNumber,
    });
  }
  @OnWorkerEvent('completed')
  handleCompleted(job: Job) {
    this.logger.info(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  handleFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed: ${err.message}`);
  }
}
