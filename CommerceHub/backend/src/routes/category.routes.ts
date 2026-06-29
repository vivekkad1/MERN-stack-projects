import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Protected routes (Admin only)
router.post('/', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), createCategory);
router.put('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateCategory);
router.delete('/:id', protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteCategory);

export default router;
