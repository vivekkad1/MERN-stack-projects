import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Please add a brand name'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String
    },
    logoUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
