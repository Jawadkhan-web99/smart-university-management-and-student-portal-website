import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISemester extends Document {
  name: string;
  semesterNumber: number;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const semesterSchema = new Schema<ISemester>(
  {
    name: {
      type: String,
      required: [true, 'Semester name is required (e.g., Fall 2026)'],
      trim: true,
      maxlength: [50, 'Semester name cannot exceed 50 characters'],
    },
    semesterNumber: {
      type: Number,
      required: [true, 'Semester number is required (1-8)'],
      min: [1, 'Semester number must be at least 1'],
      max: [12, 'Semester number cannot exceed 12'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g., 2026-2027)'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
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

export const Semester: Model<ISemester> =
  mongoose.models.Semester || mongoose.model<ISemester>('Semester', semesterSchema);

export default Semester;
