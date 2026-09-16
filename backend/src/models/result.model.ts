import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type ResultStatus = 'draft' | 'published';

export interface IResult extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  semester: Types.ObjectId;
  teacher: Types.ObjectId;
  marks: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
  remarks?: string;
  status: ResultStatus;
  createdAt: Date;
  updatedAt: Date;
}

const resultSchema = new Schema<IResult>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student user reference is required'],
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester reference is required'],
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher instructor reference is required'],
    },
    marks: {
      type: Number,
      required: [true, 'Obtained marks are required'],
      min: [0, 'Marks cannot be negative'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
      default: 100,
    },
    grade: {
      type: String,
      required: [true, 'Letter grade is required'],
      trim: true,
    },
    gradePoint: {
      type: Number,
      required: [true, 'Grade point is required'],
      min: [0, 'Grade point cannot be negative'],
      max: [4, 'Grade point cannot exceed 4.00'],
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate results for same student in same course and semester
resultSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

export const Result: Model<IResult> =
  mongoose.models.Result || mongoose.model<IResult>('Result', resultSchema);

export default Result;
