import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

// @desc    Get Seller Dashboard Stats
// @route   GET /api/seller/stats
// @access  Private/Seller
export const getSellerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user._id;

    // 1. Get all products owned by seller
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    // 2. Count active products
    const totalProducts = products.length;

    // 3. Find all orders containing these products
    const orders = await Order.find({ 'orderItems.product': { $in: productIds } });
    
    // 4. Calculate total revenue and pending orders specifically for this seller's items
    let totalRevenue = 0;
    let pendingOrders = 0;

    orders.forEach(order => {
      if (order.status === 'Pending' || order.status === 'Processing') {
        pendingOrders++;
      }
      
      if (order.isPaid) {
        order.orderItems.forEach(item => {
          if (productIds.some(id => id.equals(item.product as any))) {
            totalRevenue += (item.price * item.quantity);
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        recentOrders: orders.slice(0, 5) // Send 5 most recent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Get all orders for a seller's products
// @route   GET /api/seller/orders
// @access  Private/Seller
export const getSellerOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user._id;
    const products = await Product.find({ seller: sellerId }).select('_id');
    const productIds = products.map(p => p._id);

    const orders = await Order.find({ 'orderItems.product': { $in: productIds } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// @desc    Get all products for a seller
// @route   GET /api/seller/products
// @access  Private/Seller
export const getSellerProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user._id;
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};
