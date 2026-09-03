import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { CancelBookingJobData } from "src/common/interfaces";

@Injectable()
export class CancellationProducer {
  constructor(
    @InjectQueue('cancellation') private readonly cancellationQueue: Queue,
  ) {}
  cancelBookingJob = async (
    type: string,
    {
      userId,
      bookingId,
      reason,
      paymentType,
      providerReference,
    }: CancelBookingJobData,
  ) => {
    await this.cancellationQueue.add(
      type,
      {
        userId,
        bookingId,
        providerReference,
        paymentType,
        reason,
      },
      {
        attempts: 3,
        delay: 2000,
        removeOnFail: false,
      },
    );
  };
}
