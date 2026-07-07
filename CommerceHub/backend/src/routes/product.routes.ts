import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getSuggestions,
  getLowStock,
  bulkUpdateInventory
} from '../controllers/product.controller';
import {
  createReview,
  getProductReviews
} from '../controllers/review.controller';
import { protect, authorize, optionalAuth } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Public routes
router.get('/', getProducts);

// Protected suggestions route (must be before /:idOrSlug)
router.get('/suggestions', optionalAuth, getSuggestions);

// Inventory routes (must be before /:idOrSlug)
router.get('/inventory/low-stock', protect, authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), getLowStock);
router.put('/inventory/bulk-update', protect, authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), bulkUpdateInventory);

router.get('/:idOrSlug', getProductById);
router.get('/:productId/reviews', getProductReviews);

// Protected routes (Customer)
router.post('/:productId/reviews', protect, createReview);

// Protected routes (Seller / Admin)
router.post('/', protect, authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), createProduct);

router.put('/:id', protect, authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), updateProduct);
router.delete('/:id', protect, authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteProduct);
router.patch('/:id/inventory', protect, authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN), updateInventory);

export default router;
