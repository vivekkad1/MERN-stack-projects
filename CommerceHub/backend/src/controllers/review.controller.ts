import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

// @desc    Create a new review
// @route   POST /api/products/:productId/reviews
// @access  Private (Customer)
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, comment, images } = req.body;
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: (req as any).user.id
    });

    if (alreadyReviewed) {
      res.status(400).json({ message: 'Product already reviewed' });
      return;
    }

    const review = await Review.create({
      user: (req as any).user.id,
      product: productId,
      rating: Number(rating),
      comment,
      images
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already reviewed this product' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const pageNum = Number(req.query.page) || 1;
    const limitNum = Number(req.query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // We only fetch approved reviews
    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate('user', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ product: productId, isApproved: true });

    res.status(200).json({
      reviews,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote a review as helpful
// @route   POST /api/reviews/:id/vote
// @access  Private
export const voteHelpful = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // In a real app we'd track who voted to prevent duplicate votes per user.
    // For simplicity, we just increment it here.
    review.helpfulVotes += 1;
    await review.save();

    res.status(200).json({ message: 'Vote recorded', helpfulVotes: review.helpfulVotes });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin / Owner)
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // Check ownership or admin
    if (review.user.toString() !== (req as any).user.id && (req as any).user.role !== 'admin' && (req as any).user.role !== 'super_admin') {
      res.status(403).json({ message: 'Not authorized to delete this review' });
      return;
    }

    await review.deleteOne();
    res.status(200).json({ message: 'Review removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
