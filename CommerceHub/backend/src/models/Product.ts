import mongoose, { Document, Schema } from 'mongoose';

export interface IVariant {
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
  images?: string[];
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  seller: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  basePrice: number;
  discountPrice?: number;
  images: string[];
  videos?: string[];
  specifications?: Map<string, string>;
  variants?: IVariant[];
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  isActive: boolean;
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }]
});

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand'
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    basePrice: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number
    },
    images: {
      type: [String],
      required: true
    },
    videos: {
      type: [String]
    },
    specifications: {
      type: Map,
      of: String
    },
    variants: [variantSchema],
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    sold: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for advanced search
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, brand: 1, basePrice: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
