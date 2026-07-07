import express from 'express';
import {
  getAssignments,
  updateDeliveryStatus,
  assignOrder
} from '../controllers/delivery.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

// Delivery Partner routes
router.get('/assignments', authorize(UserRole.DELIVERY_PARTNER), getAssignments);
router.put('/orders/:id/status', authorize(UserRole.DELIVERY_PARTNER), updateDeliveryStatus);

// Admin routes for assigning
router.put('/orders/:id/assign', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), assignOrder);

export default router;
