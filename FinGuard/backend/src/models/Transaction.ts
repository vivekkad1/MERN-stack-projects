import mongoose, { Document, Schema } from 'mongoose';

export type TransactionCategory =
  | 'Housing'
  | 'Food'
  | 'Entertainment'
  | 'Utilities'
  | 'SaaS'
  | 'Transportation'
  | 'Healthcare'
  | 'Shopping'
  | 'Travel'
  | 'Education'
  | 'Investment'
  | 'Misc';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  vendor: string;
  amount: number;
  category: TransactionCategory;
  timestamp: Date;
  status: 'Cleared' | 'Flagged' | 'Pending';
  riskScore: number;
  fraudReasons: string[];
  tags: string[];
  notes: string;
  location: string;
  latitude?: number;
  longitude?: number;
  merchantLogo: string;
  isRecurring: boolean;
  receiptUrl: string;
  currency: string;
  originalAmount?: number;
  isFavorite: boolean;
  isPinned: boolean;
  paymentMethod: 'card' | 'bank_transfer' | 'cash' | 'crypto' | 'other';
  type: 'debit' | 'credit';
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  vendor: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Housing', 'Food', 'Entertainment', 'Utilities', 'SaaS', 'Transportation', 'Healthcare', 'Shopping', 'Travel', 'Education', 'Investment', 'Misc'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now, index: true },
  status: {
    type: String,
    enum: ['Cleared', 'Flagged', 'Pending'],
    default: 'Cleared',
  },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  fraudReasons: [{ type: String }],
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  location: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  merchantLogo: { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
  receiptUrl: { type: String, default: '' },
  currency: { type: String, default: 'USD' },
  originalAmount: { type: Number },
  isFavorite: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash', 'crypto', 'other'],
    default: 'card',
  },
  type: { type: String, enum: ['debit', 'credit'], default: 'debit' },
}, { timestamps: true });

// Compound index for fraud detection queries
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ userId: 1, vendor: 1, timestamp: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
