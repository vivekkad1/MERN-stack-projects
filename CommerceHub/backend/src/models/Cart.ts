import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variantSku?: string;
  variantName?: string;
  quantity: number;
  priceAtTimeOfAdding: number;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
}

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantSku: {
    type: String
  },
  variantName: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.'],
    default: 1
  },
  priceAtTimeOfAdding: {
    type: Number,
    required: true
  }
});

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One cart per user
    },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
