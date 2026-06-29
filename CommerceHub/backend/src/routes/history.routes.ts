import express from 'express';
import {
  saveSearchHistory,
  saveViewedProduct
} from '../controllers/history.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/search', saveSearchHistory);
router.post('/view', saveViewedProduct);

export default router;
