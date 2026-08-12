import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BookingRepository } from 'src/common/repositories/prisma repositories';
import { BookingStatus } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { BookingService } from 'src/modules/booking/booking.service';

@Processor('booking')
export class BookingJobProcessor extends WorkerHost {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingRepo: BookingRepository,
    private readonly logger: PinoLogger,
  ) {
    super();
  }
  async process(job: Job): Promise<any> {
    const { bookingId, userId } = job.data;
    const booking = await this.bookingRepo.findOne(
      { userId, id: bookingId, status: BookingStatus.PENDING },
      {
        select: {
          id: true,
          providerReference: true,
        },
      },
    );
    if (!booking) this.logger.info('booking is confirmed');
    await this.bookingService.cancelBooking(userId, booking.providerReference);
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
