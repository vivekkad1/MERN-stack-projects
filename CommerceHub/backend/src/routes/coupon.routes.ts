import express from 'express';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon
} from '../controllers/coupon.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Apply coupon (Customers can use this)
router.post('/apply', protect, applyCoupon);

// Admin & Seller routes
router.use(protect);
router.use(authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN));

router
  .route('/')
  .get(getCoupons)
  .post(createCoupon);

router
  .route('/:id')
  .get(getCoupon)
  .put(updateCoupon)
  .delete(deleteCoupon);

export default router;
