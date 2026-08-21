import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import { emailType } from 'src/common/enums';
import { EmailServices } from './mail.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Processor('email', { limiter: { duration: 1000, max: 8 } })
export class EmailWorker extends WorkerHost {
  constructor(
    private readonly logger: PinoLogger,
    private readonly emailServices: EmailServices,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job) {
    const { to, data } = job.data;
    let emailHtml: string;
    let emailSubject: emailType;
    switch (job.name) {
      case emailType.confirmation:
        emailHtml = await this.emailServices.createAndSendOTP(to);
        emailSubject = emailType.confirmation;
        break;
      case emailType.resetPassword:
        emailHtml = await this.emailServices.createAndSendOTP_password(to);
        emailSubject = emailType.resetPassword;
        break;
      case emailType.BanedUser:
        emailHtml = this.emailServices.bannedUser_email();
        emailSubject = emailType.BanedUser;
        break;
      case emailType.createdBooking:
        emailHtml = this.emailServices.createdBookingEmail(data);
        emailSubject = emailType.confirmation;
        break;
      case emailType.canceledBooking:
        emailHtml = this.emailServices.canceledBookingEmail(
          data.bookingNumber,
          data.hotelName,
        );
        emailSubject = emailType.canceledBooking;
        break;
      case emailType.canceledBookingWithRefund:
        emailHtml = this.emailServices.canceledBookingWithRefundEmail(
          data.bookingNumber,
          data.hotelName,
          data.refundAmount,
        );
        emailSubject = emailType.canceledBooking;
        break;
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        throw new Error('Unknown job type');
    }
    try {
      const n8nResponse = await firstValueFrom(
        this.httpService.post(this.config.getOrThrow<string>('N8N_URL'), {
          email: to,
          emailHtml,
          emailSubject,
        }),
      );
      this.logger.info(`email have send successfully :${n8nResponse.data}`);
    } catch (err) {
      this.logger.error(`err :${err}`)
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
