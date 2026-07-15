"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthStub = exports.revokeSession = exports.getSessions = exports.verify2FA = exports.generate2FA = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.sendVerificationEmail = void 0;
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const sendEmail_1 = require("../utils/sendEmail");
const crypto_1 = __importDefault(require("crypto"));
const otplib_1 = require("otplib");
const authenticator = new otplib_1.OTP({ strategy: 'totp' });
const qrcode_1 = __importDefault(require("qrcode"));
// @desc    Send OTP for email verification
// @route   POST /api/auth/verify-email/send
// @access  Private
const sendVerificationEmail = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id);
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
        user.otp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        const message = `Your email verification code is: ${otp}\nThis code is valid for 10 minutes.`;
        await (0, sendEmail_1.sendEmail)({
            email: user.email,
            subject: 'Email Verification Code',
            message
        });
        res.status(200).json({ message: 'Verification code sent to email' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
// @desc    Verify OTP
// @route   POST /api/auth/verify-email
// @access  Private
const verifyEmail = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            res.status(400).json({ message: 'Please provide OTP' });
            return;
        }
        const hashedOtp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        const user = await User_1.User.findOne({
            _id: req.user.id,
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.verifyEmail = verifyEmail;
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const user = await User_1.User.findOne({ email: req.body.email });
        if (!user) {
            res.status(404).json({ message: 'There is no user with that email' });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save({ validateBeforeSave: false });
        // In a real app, this would be your frontend URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
        const message = `Forgot your password? Please submit a PATCH request with your new password to: \n${resetUrl}\nIf you didn't forget your password, please ignore this email.`;
        try {
            await (0, sendEmail_1.sendEmail)({
                email: user.email,
                subject: 'Your password reset token (valid for 10 min)',
                message
            });
            res.status(200).json({ message: 'Token sent to email!' });
        }
        catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ message: 'There was an error sending the email. Try again later!' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto_1.default.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User_1.User.findOne({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.resetPassword = resetPassword;
// @desc    Generate 2FA Secret
// @route   POST /api/auth/2fa/generate
// @access  Private
const generate2FA = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const secret = authenticator.generateSecret();
        user.twoFactorSecret = secret;
        await user.save({ validateBeforeSave: false });
        const otpauth = authenticator.generateURI({ issuer: 'CommerceHub', label: user.email, secret });
        const qrCode = await qrcode_1.default.toDataURL(otpauth);
        res.status(200).json({ qrCode, secret });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.generate2FA = generate2FA;
// @desc    Verify & Enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
const verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User_1.User.findById(req.user.id).select('+twoFactorSecret');
        if (!user || !user.twoFactorSecret) {
            res.status(400).json({ message: '2FA secret not found' });
            return;
        }
        const isValid = authenticator.verifySync({ token, secret: user.twoFactorSecret }).valid;
        if (isValid) {
            user.twoFactorEnabled = true;
            await user.save();
            res.status(200).json({ message: '2FA enabled successfully' });
        }
        else {
            res.status(400).json({ message: 'Invalid 2FA token' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.verify2FA = verify2FA;
// @desc    Get active sessions
// @route   GET /api/auth/sessions
// @access  Private
const getSessions = async (req, res) => {
    try {
        const sessions = await Session_1.Session.find({ userId: req.user.id, isValid: true });
        res.status(200).json(sessions);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getSessions = getSessions;
// @desc    Revoke session
// @route   DELETE /api/auth/sessions/:id
// @access  Private
const revokeSession = async (req, res) => {
    try {
        const session = await Session_1.Session.findOne({ _id: req.params.id, userId: req.user.id });
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }
        session.isValid = false;
        await session.save();
        res.status(200).json({ message: 'Session revoked successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.revokeSession = revokeSession;
// @desc    OAuth Stubs
// @route   GET /api/auth/google
// @route   GET /api/auth/github
// @access  Public
const oauthStub = async (req, res) => {
    res.status(501).json({ message: 'OAuth provider implementation pending API Keys' });
};
exports.oauthStub = oauthStub;
