import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { emailType } from 'src/common/enums';
import { EmailServices } from './mail.service';

@Processor('email')
export class EmailWorker extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailServices: EmailServices,
  ) {
    super();
  }

  async process(job: Job) {
    const { to,data } = job.data;
    switch (job.name) {
      case emailType.confirmation:
        await this.emailServices.createAndSendOTP(to);
        break;
      case emailType.resetPassword:
        await this.emailServices.createAndSendOTP_password(to);
        break;
      case emailType.BanedUser:
        await this.emailServices.bannedUser_email();
        break;
      case emailType.createdBooking:
        await this.emailServices.createdBookingEmail(data);
        break;
      // case emailType.confirmedBooking:
      //   await this.emailServices.confirmedBookingEmail();
      //   break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        throw new Error('Unknown job type');
    }
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
