import express from 'express';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brand.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getBrands);

// Protected routes (Admin only)
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createBrand);
router.put('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateBrand);
router.delete('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteBrand);

export default router;
