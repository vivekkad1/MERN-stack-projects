import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserProfile
} from '../controllers/auth.controller';
import {
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  generate2FA,
  verify2FA,
  getSessions,
  revokeSession,
  oauthStub
} from '../controllers/auth.extended.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshToken);
router.get('/profile', protect, getUserProfile);

// Email Verification (OTP)
router.post('/verify-email/send', protect, sendVerificationEmail);
router.post('/verify-email', protect, verifyEmail);

// Password Management
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Two-Factor Authentication
router.post('/2fa/generate', protect, generate2FA);
router.post('/2fa/verify', protect, verify2FA);

// Session Management
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, revokeSession);

// OAuth
router.get('/google', oauthStub);
router.get('/github', oauthStub);

export default router;
