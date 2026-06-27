import express from 'express';
import { getFraudOverview, getRiskTimeline } from '../controllers/fraudController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/overview', protect, getFraudOverview);
router.get('/timeline', protect, getRiskTimeline);

export default router;
