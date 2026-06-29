import { Request, Response } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { sendEmail } from '../utils/sendEmail';
import crypto from 'crypto';
import { OTP } from 'otplib';
const authenticator = new OTP({ strategy: 'totp' });
import QRCode from 'qrcode';

// @desc    Send OTP for email verification
// @route   POST /api/auth/verify-email/send
// @access  Private
export const sendVerificationEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes
    user.otp = crypto.createHash('sha256').update(otp).digest('hex');
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const message = `Your email verification code is: ${otp}\nThis code is valid for 10 minutes.`;

    await sendEmail({
      email: user.email,
      subject: 'Email Verification Code',
      message
    });

    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      res.status(400).json({ message: 'Please provide OTP' });
      return;
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({
      _id: (req as any).user.id,
      otp: hashedOtp,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired OTP' });
      return;
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404).json({ message: 'There is no user with that email' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.save({ validateBeforeSave: false });

    // In a real app, this would be your frontend URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    const message = `Forgot your password? Please submit a PATCH request with your new password to: \n${resetUrl}\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message
      });
      res.status(200).json({ message: 'Token sent to email!' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token as string).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Token is invalid or has expired' });
      return;
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been successfully reset' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate 2FA Secret
// @route   POST /api/auth/2fa/generate
// @access  Private
export const generate2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById((req as any).user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const secret = authenticator.generateSecret();
    user.twoFactorSecret = secret;
    await user.save({ validateBeforeSave: false });

    const otpauth = authenticator.generateURI({ issuer: 'CommerceHub', label: user.email, secret });
    const qrCode = await QRCode.toDataURL(otpauth);

    res.status(200).json({ qrCode, secret });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify & Enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
export const verify2FA = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const user = await User.findById((req as any).user.id).select('+twoFactorSecret');
    
    if (!user || !user.twoFactorSecret) {
      res.status(400).json({ message: '2FA secret not found' });
      return;
    }

    const isValid = authenticator.verifySync({ token, secret: user.twoFactorSecret }).valid;
    
    if (isValid) {
      user.twoFactorEnabled = true;
      await user.save();
      res.status(200).json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid 2FA token' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active sessions
// @route   GET /api/auth/sessions
// @access  Private
export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({ userId: (req as any).user.id, isValid: true });
    res.status(200).json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke session
// @route   DELETE /api/auth/sessions/:id
// @access  Private
export const revokeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: (req as any).user.id });
    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }
    
    session.isValid = false;
    await session.save();
    
    res.status(200).json({ message: 'Session revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    OAuth Stubs
// @route   GET /api/auth/google
// @route   GET /api/auth/github
// @access  Public
export const oauthStub = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ message: 'OAuth provider implementation pending API Keys' });
};
