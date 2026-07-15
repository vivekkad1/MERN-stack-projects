"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const Order_1 = require("../models/Order");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
    apiVersion: '2026-06-24.dahlia',
});
// @desc    Create a PaymentIntent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user?.id;
        const order = await Order_1.Order.findById(orderId);
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.user.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized for this order' });
            return;
        }
        if (order.isPaid) {
            res.status(400).json({ message: 'Order is already paid' });
            return;
        }
        // Amount must be in cents/smallest currency unit for Stripe
        const amount = Math.round(order.totalPrice * 100);
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: {
                orderId: order.id,
                userId: userId
            }
        });
        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createPaymentIntent = createPaymentIntent;
// @desc    Stripe Webhook handler
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, // This MUST be the raw body, handled in app.ts
        sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock');
    }
    catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Fulfill the order
        const orderId = paymentIntent.metadata.orderId;
        if (orderId) {
            try {
                const order = await Order_1.Order.findById(orderId);
                if (order && !order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    order.paymentResult = {
                        id: paymentIntent.id,
                        status: paymentIntent.status,
                        update_time: new Date().toISOString(),
                        email_address: paymentIntent.receipt_email || '',
                    };
                    await order.save();
                    console.log(`Order ${orderId} successfully marked as paid via Webhook.`);
                }
            }
            catch (err) {
                console.error('Error updating order on webhook', err);
            }
        }
    }
    // Return a 200 response to acknowledge receipt of the event
    res.send();
};
exports.stripeWebhook = stripeWebhook;
