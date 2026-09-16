import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type NotificationType =
  | 'announcement'
  | 'assignment'
  | 'result'
  | 'attendance'
  | 'fee'
  | 'course'
  | 'general';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['announcement', 'assignment', 'result', 'attendance', 'fee', 'course', 'general'],
      default: 'general',
      index: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
