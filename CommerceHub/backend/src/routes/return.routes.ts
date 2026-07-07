import express from 'express';
import {
  createReturn,
  getReturns,
  getMyReturns,
  updateReturnStatus
} from '../controllers/return.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes are protected
router.use(protect);

// Customer routes
router.post('/', createReturn);
router.get('/myreturns', getMyReturns);

// Admin & Seller routes
router.get('/', authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), getReturns);
router.put('/:id/status', authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), updateReturnStatus);

export default router;
