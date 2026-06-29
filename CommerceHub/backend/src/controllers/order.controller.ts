import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Types } from 'mongoose';
import { UserRole } from '../models/User';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const userId = (req as any).user?.id;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    // Process each item to check stock and deduct
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404).json({ message: `Product not found: ${item.product}` });
        return;
      }

      // Check variant stock if applicable
      if (item.variantSku && product.variants && product.variants.length > 0) {
        const variantIndex = product.variants.findIndex(v => v.sku === item.variantSku);
        if (variantIndex > -1) {
          if (product.variants[variantIndex].stock < item.quantity) {
            res.status(400).json({ message: `Insufficient stock for variant ${item.variantName}` });
            return;
          }
          product.variants[variantIndex].stock -= item.quantity;
        }
      } else {
        // Base stock check
        if (product.stock < item.quantity) {
          res.status(400).json({ message: `Insufficient stock for ${product.title}` });
          return;
        }
      }
      
      // We don't save the product stock here yet, only if the whole order is valid
    }

    // Now save product stock decrements and increment sold count
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (item.variantSku && product.variants) {
          const variantIndex = product.variants.findIndex(v => v.sku === item.variantSku);
          if (variantIndex > -1) {
             product.variants[variantIndex].stock -= item.quantity;
          }
        }
        product.stock -= item.quantity;
        product.sold += item.quantity;
        await product.save();
      }
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
      // Check if order belongs to user or user is admin
      if (order.user._id.toString() !== (req as any).user?.id && (req as any).user?.role !== UserRole.ADMIN && (req as any).user?.role !== UserRole.SUPER_ADMIN) {
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

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Delivery
export const updateOrderToDelivered = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = 'Delivered';

      const updatedOrder = await order.save();
      res.status(200).json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
