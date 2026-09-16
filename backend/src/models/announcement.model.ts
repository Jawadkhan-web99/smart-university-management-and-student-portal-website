import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type AnnouncementAudience = 'all' | 'students' | 'teachers' | 'department';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  category: string;
  author: Types.ObjectId;
  audience: AnnouncementAudience;
  department?: Types.ObjectId;
  publishDate: Date;
  expiryDate?: Date;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    description: {
      type: String,
      required: [true, 'Announcement description is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
    },
    audience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'department'],
      default: 'all',
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    publishDate: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', announcementSchema);

export default Announcement;
