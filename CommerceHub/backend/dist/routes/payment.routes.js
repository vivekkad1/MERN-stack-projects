"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const razorpay_controller_1 = require("../controllers/razorpay.controller");
const router = express_1.default.Router();
// Stripe Routes
router.post('/create-intent', auth_middleware_1.protect, payment_controller_1.createPaymentIntent);
router.post('/webhook', payment_controller_1.stripeWebhook);
// Razorpay Routes
router.post('/razorpay/create-order', auth_middleware_1.protect, razorpay_controller_1.createRazorpayOrder);
router.post('/razorpay/verify', auth_middleware_1.protect, razorpay_controller_1.verifyRazorpayPayment);
exports.default = router;
