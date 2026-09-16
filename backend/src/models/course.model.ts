import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  title: string;
  description?: string;
  creditHours: number;
  department: Types.ObjectId;
  semester?: Types.ObjectId;
  teacher?: Types.ObjectId;
  enrolledStudents?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required (e.g. CS-101)'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Course title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    creditHours: {
      type: Number,
      required: [true, 'Credit hours is required'],
      min: [1, 'Credit hours must be at least 1'],
      max: [6, 'Credit hours cannot exceed 6'],
      default: 3,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
      default: null,
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    enrolledStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;
