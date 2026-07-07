import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User, UserRole } from '../models/User';
import { sendNotificationToUser } from '../socket';

// @desc    Get assigned orders for a delivery partner
// @route   GET /api/delivery/assignments
// @access  Private (Delivery Partner)
export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const deliveryPartnerId = (req as any).user._id;
    
    // Fetch orders assigned to this delivery partner
    const orders = await Order.find({ deliveryPartner: deliveryPartnerId })
      .populate('user', 'name phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update order status by delivery partner
// @route   PUT /api/delivery/orders/:id/status
// @access  Private (Delivery Partner)
export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, proofOfDelivery } = req.body;
    const deliveryPartnerId = (req as any).user._id;

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.deliveryPartner?.toString() !== deliveryPartnerId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this order' });
      return;
    }

    order.status = status || order.status;
    
    if (proofOfDelivery) {
      order.proofOfDelivery = proofOfDelivery;
    }

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();

    // Notify the customer
    sendNotificationToUser(order.user.toString(), 'notification', {
      title: 'Order Update',
      message: `Your order #${order._id.toString().substring(0, 8)} status is now: ${status}`,
      type: 'info'
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update status' });
  }
};

// @desc    Assign an order to a delivery partner
// @route   PUT /api/delivery/orders/:id/assign
// @access  Private (Admin)
export const assignOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deliveryPartnerId } = req.body;

    // Check if user exists and is a delivery partner
    const partner = await User.findOne({ _id: deliveryPartnerId, role: UserRole.DELIVERY_PARTNER });
    if (!partner) {
       res.status(404).json({ success: false, message: 'Delivery partner not found or invalid role' });
       return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    order.deliveryPartner = deliveryPartnerId;
    order.status = 'Shipped'; // typically assigning means it's shipped/out for delivery soon
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to assign order' });
  }
};
