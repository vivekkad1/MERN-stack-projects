import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserProfile
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/profile', protect, getUserProfile);

export default router;
