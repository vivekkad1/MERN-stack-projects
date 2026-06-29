import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createPaymentIntent, stripeWebhook } from '../controllers/payment.controller';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);

// Note: webhook needs raw body parser, usually set up in app.ts before this router is hit
// For simplicity we will handle it with express.raw in app.ts specifically for this route
router.post('/webhook', stripeWebhook);

export default router;
