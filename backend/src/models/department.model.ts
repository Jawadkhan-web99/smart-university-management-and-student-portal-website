import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Department code cannot exceed 10 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    headOfDepartment: {
      type: String,
      trim: true,
      default: '',
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

export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);

export default Department;
