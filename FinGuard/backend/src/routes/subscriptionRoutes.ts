import express from 'express';
import { getSubscriptions, detectSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../controllers/subscriptionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getSubscriptions).post(protect, createSubscription);
router.get('/detect', protect, detectSubscriptions);
router.route('/:id').put(protect, updateSubscription).delete(protect, deleteSubscription);

export default router;
