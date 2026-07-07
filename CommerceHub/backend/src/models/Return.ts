import mongoose, { Document, Schema } from 'mongoose';

export enum ReturnStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  REFUNDED = 'Refunded'
}

export interface IReturnItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  quantity: number;
  reason: string;
}

export interface IReturn extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  seller?: mongoose.Types.ObjectId; // Makes it easy to filter for seller dashboard
  items: IReturnItem[];
  status: ReturnStatus;
  refundAmount: number;
  comments?: string;
  adminComments?: string;
}

const returnItemSchema = new Schema<IReturnItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantSku: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true
  }
});

const returnSchema = new Schema<IReturn>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [returnItemSchema],
    status: {
      type: String,
      enum: Object.values(ReturnStatus),
      default: ReturnStatus.PENDING,
    },
    refundAmount: {
      type: Number,
      required: true,
      default: 0
    },
    comments: {
      type: String,
    },
    adminComments: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export const Return = mongoose.model<IReturn>('Return', returnSchema);
