import express from 'express';
import {
  voteHelpful,
  deleteReview
} from '../controllers/review.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Product specific review routes (create, get) are mounted in product.routes.ts

// Vote review
router.post('/:id/vote', protect, voteHelpful);

// Delete review (Admin/Super Admin only here, or we let the controller handle ownership)
router.delete('/:id', protect, deleteReview);

export default router;
