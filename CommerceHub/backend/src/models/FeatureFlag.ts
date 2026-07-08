import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureFlag extends Document {
  name: string;
  isEnabled: boolean;
  description?: string;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    isEnabled: {
      type: Boolean,
      default: false
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
);

export const FeatureFlag = mongoose.model<IFeatureFlag>('FeatureFlag', featureFlagSchema);
