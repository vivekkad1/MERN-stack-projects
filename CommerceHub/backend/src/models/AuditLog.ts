import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  targetResource?: string;
  details?: any;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetResource: {
      type: String
    },
    details: {
      type: Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
