import express from 'express';
import { getAnalytics, getCashFlow } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getAnalytics);
router.get('/cashflow', protect, getCashFlow);

export default router;
