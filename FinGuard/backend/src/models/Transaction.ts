import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  vendor: string;
  amount: number;
  category: 'Housing' | 'Food' | 'Entertainment' | 'Utilities' | 'SaaS' | 'Misc';
  timestamp: Date;
  status: 'Cleared' | 'Flagged';
}

const transactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Housing', 'Food', 'Entertainment', 'Utilities', 'SaaS', 'Misc'],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Cleared', 'Flagged'],
    default: 'Cleared'
  }
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
