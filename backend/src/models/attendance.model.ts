import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface IAttendance extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
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
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['present', 'absent', 'late'],
        message: '{VALUE} is not a valid attendance status. Allowed: present, absent, late',
      },
      required: [true, 'Attendance status is required'],
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor reference who marked attendance is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance marks for a student on the same course date
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;
