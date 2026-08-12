import { Notification, notificationDocument } from 'src/common/DB';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';

@Injectable()
export class NotificationRepository extends BaseRepository<notificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    protected notificationModel: Model<notificationDocument>,
  ) {
    super(notificationModel);
  }
  async updateNotification(
    notification: notificationDocument,
  ): Promise<notificationDocument> {
    return await notification.save();
  }
  async insert(docs: any): Promise<notificationDocument> {
    return (await this.notificationModel.insertOne(
      docs,
    )) as unknown as notificationDocument;
  }
}
