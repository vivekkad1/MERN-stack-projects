import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createPaymentIntent, stripeWebhook } from '../controllers/payment.controller';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/razorpay.controller';

const router = express.Router();

// Stripe Routes
router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', stripeWebhook);

// Razorpay Routes
router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

export default router;
