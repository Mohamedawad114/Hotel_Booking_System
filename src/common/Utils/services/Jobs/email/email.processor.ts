import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { EmailServices } from '../../mailService/mail.service';
import { emailType } from 'src/common/Enum';

@Processor('email')
export class EmailWorker extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailServices: EmailServices,
  ) {
    super();
  }

  async process(job: Job) {
    const { to } = job.data;
    switch (job.name) {
      case emailType.confirmation:
        await this.emailServices.createAndSendOTP(to);
        break;
      case emailType.resetPassword:
        await this.emailServices.createAndSendOTP_password(to);
        break;
      case emailType.BanedUser:
        await this.emailServices.bannedUser_email(to);
        break;
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
