import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type EmploymentStatus = 'active' | 'on_leave' | 'retired' | 'terminated';

export interface ITeacherProfile extends Document {
  user: Types.ObjectId;
  teacherId: string;
  department?: Types.ObjectId;
  designation: string;
  specialization?: string;
  qualification?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  joiningDate?: Date;
  employmentStatus: EmploymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const teacherProfileSchema = new Schema<ITeacherProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    teacherId: {
      type: String,
      required: [true, 'Teacher ID is required (e.g., FAC-2026-0101)'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true,
    },
    designation: {
      type: String,
      required: [true, 'Academic designation is required'],
      trim: true,
      default: 'Assistant Professor',
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    qualification: {
      type: String,
      trim: true,
      default: 'Ph.D. in Computer Science',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: () => new Date(),
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'on_leave', 'retired', 'terminated'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TeacherProfile: Model<ITeacherProfile> =
  mongoose.models.TeacherProfile ||
  mongoose.model<ITeacherProfile>('TeacherProfile', teacherProfileSchema);

export default TeacherProfile;
