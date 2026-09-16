import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type EnrollmentStatus = 'enrolled' | 'suspended' | 'graduated' | 'leave';
export type Gender = 'male' | 'female' | 'other';

export interface IStudentProfile extends Document {
  user: Types.ObjectId;
  studentId: string;
  department?: Types.ObjectId;
  program: string;
  semester?: Types.ObjectId;
  admissionYear: number;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  profileImage?: string;
  enrollmentStatus: EnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
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
    program: {
      type: String,
      required: [true, 'Academic program is required'],
      trim: true,
      default: 'BS Computer Science',
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
      default: null,
      index: true,
    },
    admissionYear: {
      type: Number,
      required: [true, 'Admission year is required'],
      default: new Date().getFullYear(),
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
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: undefined,
    },
    profileImage: {
      type: String,
      default: '',
    },
    enrollmentStatus: {
      type: String,
      enum: ['enrolled', 'suspended', 'graduated', 'leave'],
      default: 'enrolled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);

export default StudentProfile;
