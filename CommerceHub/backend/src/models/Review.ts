import mongoose, { Document, Schema } from 'mongoose';
import { Product } from './Product';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  helpfulVotes: number;
  isApproved: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: true // We can set this to false if Admin moderation is needed
    }
  },
  {
    timestamps: true
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating and save it to Product
reviewSchema.statics.getAverageRating = async function (productId: mongoose.Types.ObjectId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        numReviews: obj[0].numOfReviews
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after saving a review
reviewSchema.post('save', async function () {
  await (this.constructor as any).getAverageRating(this.product);
});

// Call getAverageRating after removing a review
// Mongoose 6+ requires document-based middleware for remove
reviewSchema.post('deleteOne', { document: true, query: false }, async function (this: IReview) {
  await (this.constructor as any).getAverageRating(this.product);
});

export const Review = mongoose.model<IReview>('Review', reviewSchema);
