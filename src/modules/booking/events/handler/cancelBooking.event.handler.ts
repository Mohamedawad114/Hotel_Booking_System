import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ConfirmBookingEvent } from '../confirmBooking.event';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { BookingJobProducer } from 'src/common/Utils/services/Jobs/booking/bookingJob.producer';
import {
  EmailProducer,
  HotelRepository,
  notificationContent,
  redis,
  redisKeys,
  TTL,
} from 'src/common';
import { emailType, NotificationTitle } from 'src/common/enums';
import { CancelBookingEvent } from '../cancelBooking.event';

@Injectable()
@EventsHandler(CancelBookingEvent)
export class CancelBookingHandler implements IEventHandler<CancelBookingEvent> {
  constructor(
    private readonly notificationRepo: NotificationRepository,
    private readonly emailQueue: EmailProducer,
  ) {}
  async handle(Event: CancelBookingEvent) {
    const { user, booking, refundAmount } = Event;
    const hotelName = await redis.get(redisKeys.hotelName(booking.id));
    await this.notificationRepo.create({
      userId: user.id,
      title: NotificationTitle.canceledBooking,
      content: notificationContent.confirmedBooking[
        NotificationTitle.canceledBooking
      ](booking.bookingNumber),
    });
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
