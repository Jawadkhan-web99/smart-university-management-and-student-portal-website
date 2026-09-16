import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type SubmissionStatus = 'submitted' | 'late' | 'graded' | 'returned';

export interface ISubmission extends Document {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  file: string;
  fileName?: string;
  fileSize?: number;
  comment?: string;
  submittedAt: Date;
  marks?: number;
  feedback?: string;
  status: SubmissionStatus;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment reference is required'],
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student user reference is required'],
      index: true,
    },
    file: {
      type: String,
      required: [true, 'Submitted file path/URL is required'],
      trim: true,
    },
    fileName: {
      type: String,
      default: '',
      trim: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
    },
    marks: {
      type: Number,
      default: null,
      min: [0, 'Marks cannot be negative'],
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded', 'returned'],
      default: 'submitted',
      index: true,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One active submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', submissionSchema);

export default Submission;
