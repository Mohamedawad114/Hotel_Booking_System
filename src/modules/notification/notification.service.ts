import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationRepository } from 'src/common/repositories/mongoose';
import { IUser } from 'src/common/interfaces';
import { decoderCursor, encodedCursor } from 'src/common';

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async getNotifications(user: IUser, cursor?: string, limit = 20) {
    if (!user || !user.id) throw new BadRequestException('user is required');
    const cursorDecoded = decoderCursor(cursor);
    const filter: any = { userId: user.id };
    if (cursorDecoded?.value) {
      filter.createdAt = { $lt: new Date(cursorDecoded.value) };
    }
    const notifications = await this.notificationRepo.findDocuments(
      filter,
      {},
      { sort: { createdAt: -1 }, limit },
    );
    if (!notifications || !notifications.length)
      return { message: 'no notifications', data: [] };
    const lastItem: any = notifications[notifications.length - 1];
    const nextCursor = encodedCursor({
      id: (lastItem._id || '').toString(),
      value: lastItem.createdAt,
    });
    return { message: 'notifications', data: notifications, meta: nextCursor };
  }
}
