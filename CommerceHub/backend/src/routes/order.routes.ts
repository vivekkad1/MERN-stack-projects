import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { addOrderItems, getMyOrders, getOrderById } from '../controllers/order.controller';

const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);

export default router;
