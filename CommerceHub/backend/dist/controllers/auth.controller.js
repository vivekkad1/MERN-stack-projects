"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.refreshToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const generateToken_1 = require("../utils/generateToken");
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User_1.User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const user = await User_1.User.create({
            name,
            email,
            password,
            role: User_1.UserRole.CUSTOMER
        });
        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: 'Registration successful'
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email }).select('+password');
        if (user && (await user.comparePassword(password))) {
            const accessToken = (0, generateToken_1.generateAccessToken)(user.id, user.role);
            const refreshToken = (0, generateToken_1.generateRefreshToken)(user.id);
            // Save session
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
            await Session_1.Session.create({
                userId: user.id,
                refreshToken,
                userAgent: req.headers['user-agent'] || '',
                ipAddress: req.ip || '',
                expiresAt
            });
            // Set cookie for refresh token
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                token: accessToken
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.loginUser = loginUser;
// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies?.jwt;
        if (refreshToken) {
            await Session_1.Session.findOneAndUpdate({ refreshToken }, { isValid: false });
        }
        res.cookie('jwt', '', {
            httpOnly: true,
            expires: new Date(0)
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.logoutUser = logoutUser;
// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.jwt;
        if (!refreshToken) {
            res.status(401).json({ message: 'Not authorized, no refresh token' });
            return;
        }
        const session = await Session_1.Session.findOne({ refreshToken, isValid: true });
        if (!session) {
            res.status(401).json({ message: 'Not authorized, invalid session' });
            return;
        }
        const user = await User_1.User.findById(session.userId);
        if (!user) {
            res.status(401).json({ message: 'Not authorized, user not found' });
            return;
        }
        const newAccessToken = (0, generateToken_1.generateAccessToken)(user.id, user.role);
        res.json({ token: newAccessToken });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.refreshToken = refreshToken;
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                isEmailVerified: user.isEmailVerified
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserProfile = getUserProfile;
