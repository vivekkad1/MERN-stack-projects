import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: Date;
  endDate: Date;
  color: string;
  icon: string;
  alertThreshold: number; // % at which to alert (e.g., 80)
  isActive: boolean;
}

const budgetSchema = new Schema<IBudget>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  color: { type: String, default: '#10b981' },
  icon: { type: String, default: '💰' },
  alertThreshold: { type: Number, default: 80 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
