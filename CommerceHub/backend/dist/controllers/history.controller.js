"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveViewedProduct = exports.saveSearchHistory = void 0;
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Add a search term to history
// @route   POST /api/history/search
// @access  Private
const saveSearchHistory = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ success: false, message: 'Invalid search query' });
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Initialize if undefined
        user.searchHistory = user.searchHistory || [];
        // Remove if it already exists to move it to the front
        user.searchHistory = user.searchHistory.filter(q => q.toLowerCase() !== query.trim().toLowerCase());
        // Add to the beginning
        user.searchHistory.unshift(query.trim());
        // Limit history to 15 items to prevent bloat
        if (user.searchHistory.length > 15) {
            user.searchHistory = user.searchHistory.slice(0, 15);
        }
        await user.save();
        res.status(200).json({ success: true, data: user.searchHistory });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveSearchHistory = saveSearchHistory;
// @desc    Add a product to viewed history
// @route   POST /api/history/view
// @access  Private
const saveViewedProduct = async (req, res) => {
    try {
        let { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }
        // Support dummy frontend IDs by padding to 24 hex characters
        if (productId.length < 24) {
            productId = productId.padStart(24, '0');
        }
        const user = await User_1.User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Initialize if undefined
        user.viewedProducts = user.viewedProducts || [];
        // Remove if it already exists to move it to the front
        user.viewedProducts = user.viewedProducts.filter(id => id.toString() !== productId);
        // Add to the beginning
        user.viewedProducts.unshift(new mongoose_1.default.Types.ObjectId(productId));
        // Limit history to 20 items
        if (user.viewedProducts.length > 20) {
            user.viewedProducts = user.viewedProducts.slice(0, 20);
        }
        await user.save();
        res.status(200).json({ success: true, data: user.viewedProducts });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.saveViewedProduct = saveViewedProduct;
