import express from 'express';
import { getInsights, chatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/insights', protect, getInsights);
router.post('/chat', protect, chatWithAI);

export default router;
