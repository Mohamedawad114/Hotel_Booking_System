import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingRepository } from 'src/common/repositories/prisma repositories';
import { BookingStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { BookingService } from 'src/modules/booking/booking.service';
import { EmailProducer } from '../email/email.producer';
import { emailType, NotificationTitle } from 'src/common/enums';
import { NotificationService } from 'src/modules/notification/notification.service';

@Processor('booking')
export class BookingJobProcessor extends WorkerHost {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingRepo: BookingRepository,
    private readonly logger: PinoLogger,
    private readonly emailQueue: EmailProducer,
    private readonly notificationService: NotificationService,
  ) {
    super();
  }
  async process(job: Job): Promise<any> {
    const { bookingId, hotelName, user } = job.data;
    const booking = await this.bookingRepo.findOne(
      { userId: user.id, id: bookingId, status: BookingStatus.PENDING },
      {
        select: {
          id: true,
          payment: true,
          providerReference: true,
          bookingNumber: true,
        },
      },
    );
    if (!booking) {
      this.logger.info('booking is confirmed');
      return;
    }
    const paymentId = booking.payment?.id;
    await this.bookingService.cancelBooking(
      user.id,
      booking.providerReference,
      paymentId,
    );
    await this.notificationService.createNotification(
      user.id,
      NotificationTitle.canceledBooking,
      booking.bookingNumber,
      booking.totalPrice,
    );

    await this.emailQueue.sendEmailJob(emailType.canceledBooking, user.email, {
      bookingNumber: booking.bookingNumber,
      hotelName: hotelName,
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
