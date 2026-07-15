"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Apply coupon (Customers can use this)
router.post('/apply', auth_middleware_1.protect, coupon_controller_1.applyCoupon);
// Admin & Seller routes
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN));
router
    .route('/')
    .get(coupon_controller_1.getCoupons)
    .post(coupon_controller_1.createCoupon);
router
    .route('/:id')
    .get(coupon_controller_1.getCoupon)
    .put(coupon_controller_1.updateCoupon)
    .delete(coupon_controller_1.deleteCoupon);
exports.default = router;
