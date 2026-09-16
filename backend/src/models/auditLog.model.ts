import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  description: string;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Audit action is required'],
      trim: true,
      index: true,
    },
    entity: {
      type: String,
      required: [true, 'Audit target entity is required'],
      trim: true,
      index: true,
    },
    entityId: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Audit description is required'],
      trim: true,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
