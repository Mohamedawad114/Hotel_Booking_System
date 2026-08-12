import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  BookingJobProducer,
  EmailProducer,
  HotelRepository,
  notificationContent,
} from 'src/common';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { emailType, NotificationTitle } from 'src/common/enums';
import { ConfirmBookingEvent } from '../confirmBooking.event';

@Injectable()
@EventsHandler(ConfirmBookingEvent)
export class ConfirmBookingHandler implements IEventHandler<ConfirmBookingEvent> {
  constructor(
    private readonly bookingQueue: BookingJobProducer,
    private readonly notificationRepo: NotificationRepository,
    private readonly emailQueue: EmailProducer,
    private readonly hotelRepo: HotelRepository,
  ) {}
  async handle(Event: ConfirmBookingEvent) {
    const { user, booking, hotelCode } = Event;
    await this.bookingQueue.addBookingJob(user.id, booking.id);
    await this.notificationRepo.create({
      userId: user.id,
      title: NotificationTitle.createdBooking,
      content: notificationContent.confirmedBooking[
        NotificationTitle.confirmedBooking
      ](booking.bookingNumber),
    });
    const hotel = await this.hotelRepo.findUnique(
      { code: hotelCode },
      { select: { name: true } },
    );
    await this.emailQueue.sendEmailJob(emailType.createdBooking, user.email, {
      username: user.name,
      ...booking,
      hotelName: hotel.name,
    });
  }
}
