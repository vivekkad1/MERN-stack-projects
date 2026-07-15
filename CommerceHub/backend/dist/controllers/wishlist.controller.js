"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromWishlist = exports.addToWishlist = exports.getWishlist = void 0;
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            count: user.wishlist?.length || 0,
            data: user.wishlist || []
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getWishlist = getWishlist;
// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/:productId
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        let productId = req.params.productId;
        // Support dummy frontend IDs by padding to 24 hex characters
        if (productId.length < 24) {
            productId = productId.padStart(24, '0');
        }
        // Check if product exists
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Check if product is already in wishlist
        if (user.wishlist && user.wishlist.includes(new mongoose_1.default.Types.ObjectId(productId))) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }
        // String comparison as fallback for ObjectIds
        if (user.wishlist && user.wishlist.some(id => id.toString() === productId)) {
            return res.status(400).json({ success: false, message: 'Product already in wishlist' });
        }
        user.wishlist = user.wishlist || [];
        user.wishlist.push(new mongoose_1.default.Types.ObjectId(productId));
        await user.save();
        const populatedUser = await User_1.User.findById(req.user.id).populate('wishlist');
        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            data: populatedUser?.wishlist || []
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addToWishlist = addToWishlist;
// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        let productId = req.params.productId;
        // Support dummy frontend IDs by padding to 24 hex characters
        if (productId.length < 24) {
            productId = productId.padStart(24, '0');
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (!user.wishlist) {
            return res.status(200).json({ success: true, data: [] });
        }
        // Filter out the productId
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();
        const populatedUser = await User_1.User.findById(req.user.id).populate('wishlist');
        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            data: populatedUser?.wishlist || []
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.removeFromWishlist = removeFromWishlist;
