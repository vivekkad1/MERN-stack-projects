"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.voteHelpful = exports.getProductReviews = exports.createReview = void 0;
const Review_1 = require("../models/Review");
const Product_1 = require("../models/Product");
// @desc    Create a new review
// @route   POST /api/products/:productId/reviews
// @access  Private (Customer)
const createReview = async (req, res) => {
    try {
        const { rating, comment, images } = req.body;
        const productId = req.params.productId;
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Check if user already reviewed
        const alreadyReviewed = await Review_1.Review.findOne({
            product: productId,
            user: req.user.id
        });
        if (alreadyReviewed) {
            res.status(400).json({ message: 'Product already reviewed' });
            return;
        }
        const review = await Review_1.Review.create({
            user: req.user.id,
            product: productId,
            rating: Number(rating),
            comment,
            images
        });
        res.status(201).json({ message: 'Review added successfully', review });
    }
    catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'You have already reviewed this product' });
        }
        else {
            res.status(500).json({ message: error.message });
        }
    }
};
exports.createReview = createReview;
// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const productId = req.params.productId;
        const pageNum = Number(req.query.page) || 1;
        const limitNum = Number(req.query.limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        // We only fetch approved reviews
        const reviews = await Review_1.Review.find({ product: productId, isApproved: true })
            .populate('user', 'name avatarUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Review_1.Review.countDocuments({ product: productId, isApproved: true });
        res.status(200).json({
            reviews,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductReviews = getProductReviews;
// @desc    Vote a review as helpful
// @route   POST /api/reviews/:id/vote
// @access  Private
const voteHelpful = async (req, res) => {
    try {
        const review = await Review_1.Review.findById(req.params.id);
        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }
        // In a real app we'd track who voted to prevent duplicate votes per user.
        // For simplicity, we just increment it here.
        review.helpfulVotes += 1;
        await review.save();
        res.status(200).json({ message: 'Vote recorded', helpfulVotes: review.helpfulVotes });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.voteHelpful = voteHelpful;
// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Admin / Owner)
const deleteReview = async (req, res) => {
    try {
        const review = await Review_1.Review.findById(req.params.id);
        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }
        // Check ownership or admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            res.status(403).json({ message: 'Not authorized to delete this review' });
            return;
        }
        await review.deleteOne();
        res.status(200).json({ message: 'Review removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteReview = deleteReview;
