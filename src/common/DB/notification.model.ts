import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { INotification } from '../interfaces/notification.interface';
import { NotificationTitle } from '../enums/notification.enum';

@Schema({ autoIndex: true, strict: true, strictQuery: true, timestamps: true })
export class Notification implements INotification {
  @Prop({ type: String, enum: NotificationTitle, required: true })
  title!: NotificationTitle;
  @Prop({ type: String, required: true, maxLength: 500 })
  content!: string;
  @Prop({ type: Number, required: true, min: 1 })
  userId!: number;
  @Prop({ type: Boolean, default: false })
  isRead!: boolean;
}
const notificationSchema = SchemaFactory.createForClass(Notification);
export type notificationDocument = HydratedDocument<Notification>;
export const notificationModel = MongooseModule.forFeature([
  {
    schema: notificationSchema,
    name: Notification.name,
  },
]);
