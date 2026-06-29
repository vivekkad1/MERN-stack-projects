import express from 'express';
import { getSellerStats, getSellerOrders, getSellerProducts } from '../controllers/seller.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require SELLER role
router.use(protect);
router.use(authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/stats', getSellerStats);
router.get('/orders', getSellerOrders);
router.get('/products', getSellerProducts);

export default router;
