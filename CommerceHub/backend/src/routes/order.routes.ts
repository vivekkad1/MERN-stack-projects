import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';
import { 
  addOrderItems, 
  getMyOrders, 
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders
} from '../controllers/order.controller';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, updateOrderToPaid);

router.route('/:id/deliver').put(protect, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DELIVERY_PARTNER), updateOrderToDelivered);

export default router;
