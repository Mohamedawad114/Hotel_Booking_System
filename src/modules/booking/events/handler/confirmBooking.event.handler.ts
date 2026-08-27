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
import { NotificationService } from 'src/modules/notification/notification.service';
import { Gateway } from 'src/modules/gateway/gateway';

@Injectable()
@EventsHandler(ConfirmBookingEvent)
export class ConfirmBookingHandler implements IEventHandler<ConfirmBookingEvent> {
  constructor(
    private readonly bookingQueue: BookingJobProducer,
    private readonly notificationService: NotificationService,
    private readonly emailQueue: EmailProducer,
    private readonly GatewayService: Gateway,
    private readonly hotelRepo: HotelRepository,
  ) {}
  async handle(Event: ConfirmBookingEvent) {
    const { user, booking, hotelCode } = Event;
    const hotel = await this.hotelRepo.findUnique(
      { code: hotelCode },
      { select: { name: true } },
    );
    await redis.setex(
      redisKeys.hotelName(booking.id),
      TTL.hotelName,
      hotel.name,
    );
    await this.GatewayService.sendNotificationAdmin(
      booking.bookingNumber,
      booking.totalPrice,
      NotificationTitle.createdBookingAdmin,
      user.email,
    );
    await this.bookingQueue.addBookingJob(user, hotel.name, booking.id);
    await this.notificationService.createNotification(
      user.id,
      NotificationTitle.createdBooking,
      booking.bookingNumber,
      booking.totalPrice,
    );

    await this.emailQueue.sendEmailJob(emailType.createdBooking, user.email, {
      username: user.name,
      ...booking,
      hotelName: hotel.name,
    });
    await redis.del(
      redisKeys.dashboardBookings({
        day: '*',
        limit: '*',
        cursor: '*',
        month: '*',
      }),
    );
  }
}
