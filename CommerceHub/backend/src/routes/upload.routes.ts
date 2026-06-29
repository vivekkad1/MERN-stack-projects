import express from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Allow authenticated sellers and admins to upload images
router.post(
  '/',
  protect,
  authorize(UserRole.SELLER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.single('image'),
  uploadImage
);

export default router;
