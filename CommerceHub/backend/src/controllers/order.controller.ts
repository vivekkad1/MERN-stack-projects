import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Types } from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const userId = (req as any).user?.id;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const order = new Order({
      user: userId,
      orderItems: orderItems.map((item: any) => ({
        ...item,
        product: Types.ObjectId.isValid(item.product) 
          ? new Types.ObjectId(item.product) 
          : new Types.ObjectId('000000000000000000000000') // fallback for mock data
      })),
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Clear user cart after placing order
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(201).json(createdOrder);
  } catch (error: any) {
    require('fs').writeFileSync('C:/Users/visha/.gemini/antigravity-ide/brain/33d27a51-b9e8-42f5-960c-be78adc7cf2f/scratch/order_error.txt', error.stack || error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ user: (req as any).user?.id }).populate('orderItems.product', 'title images basePrice');
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'title images basePrice');

    if (order) {
      // Check if order belongs to user or user is admin (simplified for now)
      if (order.user._id.toString() !== (req as any).user?.id) {
         res.status(403).json({ message: 'Not authorized to view this order' });
         return;
      }
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
