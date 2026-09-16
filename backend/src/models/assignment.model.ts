import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type AssignmentStatus = 'draft' | 'published' | 'closed';

export interface IAssignment extends Document {
  title: string;
  description: string;
  course: Types.ObjectId;
  teacher: Types.ObjectId;
  dueDate: Date;
  totalMarks: number;
  attachment?: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
      trim: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher instructor reference is required'],
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be at least 1'],
      default: 100,
    },
    attachment: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;
