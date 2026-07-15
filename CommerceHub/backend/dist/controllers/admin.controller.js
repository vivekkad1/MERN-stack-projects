"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getAllUsers = exports.getAdminStats = void 0;
const User_1 = require("../models/User");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User_1.User.countDocuments({ role: User_1.UserRole.CUSTOMER });
        const totalSellers = await User_1.User.countDocuments({ role: User_1.UserRole.SELLER });
        const totalProducts = await Product_1.Product.countDocuments();
        const totalOrders = await Order_1.Order.countDocuments();
        // Calculate total revenue from paid orders
        const revenueResult = await Order_1.Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
        // Get recent orders
        const recentOrders = await Order_1.Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
        // Get recent users
        const recentUsers = await User_1.User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-password');
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalSellers,
                totalProducts,
                totalOrders,
                totalRevenue,
                recentOrders,
                recentUsers
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
exports.getAdminStats = getAdminStats;
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const query = {};
        if (role) {
            query.role = role;
        }
        const users = await User_1.User.find(query).select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
exports.getAllUsers = getAllUsers;
// @desc    Update User Role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        // Validate role
        if (!Object.values(User_1.UserRole).includes(role)) {
            res.status(400).json({ success: false, message: 'Invalid role' });
            return;
        }
        const user = await User_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error });
    }
};
exports.updateUserRole = updateUserRole;
