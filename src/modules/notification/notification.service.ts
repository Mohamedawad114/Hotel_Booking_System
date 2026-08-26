import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { IUser } from 'src/common/interfaces';
import { decoderCursor, encodedCursor, notificationContent } from 'src/common';
import { NotificationTitle } from 'src/common/enums';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}
  async getNotifications(user: IUser, cursor?: string, limit = 20) {
    if (!user || !user.id) throw new BadRequestException('user is required');
    const cursorDecoded = decoderCursor(cursor);
    const filter: any = { userId: user.id };
    if (cursorDecoded?.value) {
      ((filter.createdAt = { $lt: new Date(cursorDecoded.value) }),
        (filter._id = { $lt: cursorDecoded.id }));
    }
    const notifications = await this.notificationRepo.findDocuments(
      filter,
      {},
      { sort: { createdAt: -1, id: -1 }, limit },
    );
    if (!notifications || !notifications.length)
      return { message: 'no notifications', data: [] };
    const lastItem: any = notifications[notifications.length - 1];
    const nextCursor = encodedCursor({
      id: (lastItem._id || '').toString(),
      value: lastItem.createdAt,
    });
    const ids = notifications.map((n) => n._id);
    await this.notificationRepo.updateManyDocuments(
      { _id: { $in: ids }, isRead: false },
      { isRead: true },
    );
    return { message: 'notifications', data: notifications, meta: nextCursor };
  }
  async createNotification(
    userId: number,
    title: NotificationTitle,
    bookingNumber: string,
    totalPrice: number,
  ) {
    return await this.notificationRepo.create({
      userId,
      title,
      content: notificationContent[title](bookingNumber, totalPrice),
    });
  }
}
