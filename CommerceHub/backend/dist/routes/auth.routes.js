"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_extended_controller_1 = require("../controllers/auth.extended.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/register', auth_controller_1.registerUser);
router.post('/login', auth_controller_1.loginUser);
router.post('/logout', auth_controller_1.logoutUser);
router.post('/refresh', auth_controller_1.refreshToken);
router.get('/profile', auth_middleware_1.protect, auth_controller_1.getUserProfile);
// Email Verification (OTP)
router.post('/verify-email/send', auth_middleware_1.protect, auth_extended_controller_1.sendVerificationEmail);
router.post('/verify-email', auth_middleware_1.protect, auth_extended_controller_1.verifyEmail);
// Password Management
router.post('/forgot-password', auth_extended_controller_1.forgotPassword);
router.post('/reset-password/:token', auth_extended_controller_1.resetPassword);
// Two-Factor Authentication
router.post('/2fa/generate', auth_middleware_1.protect, auth_extended_controller_1.generate2FA);
router.post('/2fa/verify', auth_middleware_1.protect, auth_extended_controller_1.verify2FA);
// Session Management
router.get('/sessions', auth_middleware_1.protect, auth_extended_controller_1.getSessions);
router.delete('/sessions/:id', auth_middleware_1.protect, auth_extended_controller_1.revokeSession);
// OAuth
router.get('/google', auth_extended_controller_1.oauthStub);
router.get('/github', auth_extended_controller_1.oauthStub);
exports.default = router;
