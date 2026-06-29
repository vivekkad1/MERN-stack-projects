import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).user.id).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      count: user.wishlist?.length || 0,
      data: user.wishlist || []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/:productId
// @access  Private
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    let productId = req.params.productId as string;
    
    // Support dummy frontend IDs by padding to 24 hex characters
    if (productId.length < 24) {
      productId = productId.padStart(24, '0');
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if product is already in wishlist
    if (user.wishlist && user.wishlist.includes(new mongoose.Types.ObjectId(productId))) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    // String comparison as fallback for ObjectIds
    if (user.wishlist && user.wishlist.some(id => id.toString() === productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    user.wishlist = user.wishlist || [];
    user.wishlist.push(new mongoose.Types.ObjectId(productId));
    await user.save();
    
    const populatedUser = await User.findById((req as any).user.id).populate('wishlist');
    
    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: populatedUser?.wishlist || []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    let productId = req.params.productId as string;
    
    // Support dummy frontend IDs by padding to 24 hex characters
    if (productId.length < 24) {
      productId = productId.padStart(24, '0');
    }
    
    const user = await User.findById((req as any).user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.wishlist) {
      return res.status(200).json({ success: true, data: [] });
    }
    
    // Filter out the productId
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    
    const populatedUser = await User.findById((req as any).user.id).populate('wishlist');
    
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: populatedUser?.wishlist || []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
