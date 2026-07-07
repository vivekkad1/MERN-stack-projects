import { Request, Response } from 'express';
import { Return, ReturnStatus } from '../models/Return';
import { Order } from '../models/Order';
import { UserRole } from '../models/User';

// @desc    Create a return request
// @route   POST /api/returns
// @access  Private (Customer)
export const createReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, items, comments } = req.body;
    const userId = (req as any).user._id;

    // Verify order belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (order.user.toString() !== userId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to return this order' });
      return;
    }

    if (order.status !== 'Delivered') {
      res.status(400).json({ success: false, message: 'Only delivered orders can be returned' });
      return;
    }

    // Check if return already exists for this order (simplified logic: one return per order)
    const existingReturn = await Return.findOne({ order: orderId });
    if (existingReturn) {
      res.status(400).json({ success: false, message: 'Return request already exists for this order' });
      return;
    }

    // Calculate initial refund amount based on items
    let refundAmount = 0;
    for (const returnItem of items) {
      const orderItem = order.orderItems.find(
        item => item.product.toString() === returnItem.product.toString()
      );
      if (orderItem) {
         // This is a naive calculation, we might need proportional discount deduction
         refundAmount += orderItem.price * returnItem.quantity;
      }
    }

    // Here you might look up the seller from the products, assuming order-level seller or first item's seller
    // For simplicity, we leave seller optional or derive it from the first product
    
    const returnRequest = await Return.create({
      order: orderId,
      user: userId,
      items,
      refundAmount,
      comments
    });

    res.status(201).json({
      success: true,
      data: returnRequest
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to create return request' });
  }
};

// @desc    Get all returns
// @route   GET /api/returns
// @access  Private (Admin/Seller)
export const getReturns = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user.role;
    let query = {};
    
    if (userRole === UserRole.SELLER) {
      query = { seller: (req as any).user._id };
    }

    const returns = await Return.find(query)
      .populate('user', 'name email')
      .populate('order', 'totalPrice status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get returns for logged in user
// @route   GET /api/returns/myreturns
// @access  Private (Customer)
export const getMyReturns = async (req: Request, res: Response): Promise<void> => {
  try {
    const returns = await Return.find({ user: (req as any).user._id })
      .populate('order', 'totalPrice status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update return status
// @route   PUT /api/returns/:id/status
// @access  Private (Admin/Seller)
export const updateReturnStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, adminComments, refundAmount } = req.body;
    let returnRequest = await Return.findById(req.params.id);

    if (!returnRequest) {
      res.status(404).json({ success: false, message: 'Return request not found' });
      return;
    }

    if ((req as any).user.role === UserRole.SELLER && returnRequest.seller?.toString() !== (req as any).user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this return' });
      return;
    }

    returnRequest.status = status || returnRequest.status;
    if (adminComments) returnRequest.adminComments = adminComments;
    if (refundAmount !== undefined) returnRequest.refundAmount = refundAmount;

    // Simulate refund logic if status changes to REFUNDED
    if (status === ReturnStatus.REFUNDED) {
      // In a real app, integrate with Stripe/Razorpay here
      console.log(`Simulating refund of $${returnRequest.refundAmount} for return ${returnRequest._id}`);
    }

    await returnRequest.save();

    res.status(200).json({
      success: true,
      data: returnRequest
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update return status' });
  }
};
