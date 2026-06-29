import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order } from '../models/Order';

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay/create-order
// @access  Private
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body; // Amount should be in rupees

    // Gracefully handle missing keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn("Razorpay keys not found. Mocking successful order creation.");
      res.status(200).json({
        success: true,
        data: {
          id: `order_mock_${Math.random().toString(36).substring(7)}`,
          amount: amount * 100, // in paise
          currency: "INR",
          mocked: true
        }
      });
      return;
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    res.status(500).json({ success: false, message: 'Razorpay order creation failed', error });
  }
};

// @desc    Verify Razorpay Payment and create Order
// @route   POST /api/payment/razorpay/verify
// @access  Private
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData // the full order details sent from the frontend
    } = req.body;

    let isAuthentic = true;

    // Only verify signature if we aren't using mocked keys
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !razorpay_order_id.startsWith('order_mock_')) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
      // Payment is successful, create the order in DB
      const newOrder = new Order({
        ...orderData,
        user: (req as any).user._id,
        isPaid: true,
        paidAt: new Date(),
        paymentResult: {
          id: razorpay_payment_id,
          status: 'Success',
          update_time: new Date().toISOString(),
          email_address: (req as any).user.email
        }
      });

      const createdOrder = await newOrder.save();

      res.status(201).json({
        success: true,
        message: "Payment verified successfully",
        data: createdOrder
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    res.status(500).json({ success: false, message: 'Payment verification failed', error });
  }
};
