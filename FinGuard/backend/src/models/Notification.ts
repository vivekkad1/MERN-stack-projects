import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'fraud_alert' | 'budget_alert' | 'goal_completed' | 'income_received' | 'bill_due' | 'subscription_renewal' | 'system' | 'ai_insight';
  severity: 'info' | 'warning' | 'critical' | 'success';
  isRead: boolean;
  data?: Record<string, unknown>;
  actionUrl?: string;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['fraud_alert', 'budget_alert', 'goal_completed', 'income_received', 'bill_due', 'subscription_renewal', 'system', 'ai_insight'],
    required: true,
  },
  severity: { type: String, enum: ['info', 'warning', 'critical', 'success'], default: 'info' },
  isRead: { type: Boolean, default: false, index: true },
  data: { type: Schema.Types.Mixed },
  actionUrl: { type: String },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
