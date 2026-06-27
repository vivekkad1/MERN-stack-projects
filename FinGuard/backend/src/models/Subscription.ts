import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  vendor: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly' | 'weekly';
  nextBillingDate: Date;
  category: string;
  logo: string;
  isActive: boolean;
  isDetectedAutomatically: boolean;
  lastChargeDate: Date;
  cancelUrl: string;
  notes: string;
}

const subscriptionSchema = new Schema<ISubscription>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  vendor: { type: String, required: true },
  amount: { type: Number, required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'weekly'], default: 'monthly' },
  nextBillingDate: { type: Date },
  category: { type: String, default: 'SaaS' },
  logo: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isDetectedAutomatically: { type: Boolean, default: false },
  lastChargeDate: { type: Date },
  cancelUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
