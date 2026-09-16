import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type FeeStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overdue';

export interface IFee extends Document {
  student: Types.ObjectId;
  semester: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  paidAmount: number;
  remainingAmount: number;
  status: FeeStatus;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const feeSchema = new Schema<IFee>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
      index: true,
    },
    semester: {
      type: Schema.Types.ObjectId,
      ref: 'Semester',
      required: [true, 'Semester reference is required'],
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Total fee amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Fee due date is required'],
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      default: function (this: IFee) {
        return this.amount - (this.paidAmount || 0);
      },
    },
    status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue'],
      default: 'unpaid',
      index: true,
    },
    description: {
      type: String,
      default: 'Semester Tuition Fee & Facilities Voucher',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to compute remaining amount and status
feeSchema.pre('save', function () {
  this.remainingAmount = Math.max(0, this.amount - (this.paidAmount || 0));
  if (this.remainingAmount === 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partially_paid';
  } else if (new Date() > new Date(this.dueDate)) {
    this.status = 'overdue';
  } else {
    this.status = 'unpaid';
  }
});

export const Fee: Model<IFee> = mongoose.models.Fee || mongoose.model<IFee>('Fee', feeSchema);

export default Fee;
