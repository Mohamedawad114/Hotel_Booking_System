import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EmailProducer, redis, redisKeys } from 'src/common';
import { emailType, NotificationTitle } from 'src/common/enums';
import { CancelBookingEvent } from '../cancelBooking.event';
import { NotificationService } from 'src/modules/notification/notification.service';
import { PaymentService } from 'src/modules/payment/payment.service';

@Injectable()
@EventsHandler(CancelBookingEvent)
export class CancelBookingHandler implements IEventHandler<CancelBookingEvent> {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailQueue: EmailProducer,
    private readonly paymentService: PaymentService,
  ) {}
  async handle(Event: CancelBookingEvent) {
    const { user, booking, refundAmount } = Event;
    const hotelName = await redis.get(redisKeys.hotelName(booking.id));
    if (refundAmount && refundAmount > 0) {
      await this.paymentService.refund(booking.id, refundAmount);
    }
    await this.notificationService.createNotification(
      user.id,
      NotificationTitle.canceledBooking,
      booking.bookingNumber,
      booking.totalPrice,
    );
    if (!refundAmount) {
      await this.emailQueue.sendEmailJob(
        emailType.canceledBooking,
        user.email,
        {
          username: user.name,
          ...booking,
          hotelName: hotelName,
        },
      );
    } else {
      await this.emailQueue.sendEmailJob(
        emailType.canceledBookingWithRefund,
        user.email,
        {
          refundAmount: refundAmount,
          bookingNumber: booking.bookingNumber,
          hotelName: hotelName!,
        },
      );
    }
  }
}