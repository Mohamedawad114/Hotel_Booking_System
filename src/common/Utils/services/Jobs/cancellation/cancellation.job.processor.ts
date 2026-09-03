import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { EventBus } from "@nestjs/cqrs";
import { BookingStatus, paymentStatus, PaymentType } from "@prisma/client";
import { Job } from "bullmq";
import { PinoLogger } from "nestjs-pino";
import { BookingRepository } from "src/common/repositories/prisma repositories";
import { CancelBookingEvent } from "src/modules/booking/events/cancelBooking.event";
import { BookingService } from "src/modules/booking/booking.service";
import { HotelbedsProvider } from "../../hotel provider/provider.service";

@Processor('cancellation')
export class CancellationProcessor extends WorkerHost {
  constructor(
    private readonly bookingRepo: BookingRepository,
    private readonly providerService: HotelbedsProvider,
    private readonly bookingService: BookingService,
    private readonly eventBus: EventBus,
    private readonly logger: PinoLogger,
  ) {
    super();
  }

  async process(job: Job) {
    const { userId, bookingId, providerReference, paymentType, reason } =
      job.data;

    try {
      const booking = await this.bookingRepo.findOne({
        userId,
        id: bookingId,
      });
      if (!booking) return;
      if (
        booking.status === BookingStatus.PENDING ||
        paymentType === PaymentType.AT_HOTEL
      ) {
        await this.bookingService.cancelBooking(userId, providerReference);
        await this.eventBus.publish(
          new CancelBookingEvent(booking.user, booking, 0),
        );
      } else if (
        booking.status === BookingStatus.CANCELLATION_PROCESSING &&
        paymentType === PaymentType.AT_WEB
      ) {
        const cancellationResult = await this.providerService.CancelBooking(
          providerReference!,
        );
        await this.bookingRepo.updateOne(
          { id: booking.id, userId },
          {
            status: BookingStatus.CANCELLED,
            refundAmount: cancellationResult.refundAmount,
            cancellationFees: cancellationResult.cancellationFee,
            cancellationReference: cancellationResult.cancellationReference,
            cancellationReason: reason,
            payment: {
              update: {
                status: paymentStatus.Refund,
              },
            },
          },
        );
        await this.eventBus.publish(
          new CancelBookingEvent(
            booking.user,
            booking,
            cancellationResult.refundAmount,
          ),
        );
      }
    } catch (error) {
      await this.bookingRepo.updateOne(
        { id: bookingId, userId },
        { status: BookingStatus.CONFIRMED },
      );
      throw error;
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
