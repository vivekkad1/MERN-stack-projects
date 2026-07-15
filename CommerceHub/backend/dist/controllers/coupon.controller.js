"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCoupon = exports.deleteCoupon = exports.updateCoupon = exports.createCoupon = exports.getCoupon = exports.getCoupons = void 0;
const Coupon_1 = require("../models/Coupon");
const User_1 = require("../models/User");
// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin/Seller)
const getCoupons = async (req, res) => {
    try {
        const userRole = req.user.role;
        let query = {};
        // Sellers only see their own coupons (or maybe admin coupons if we want them to use it, but typically sellers only manage their own)
        if (userRole === User_1.UserRole.SELLER) {
            query = { seller: req.user._id };
        }
        const coupons = await Coupon_1.Coupon.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getCoupons = getCoupons;
// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private (Admin/Seller)
const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon_1.Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }
        // Ensure sellers can only access their own coupons
        if (req.user.role === User_1.UserRole.SELLER && coupon.seller?.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to access this coupon' });
            return;
        }
        res.status(200).json({
            success: true,
            data: coupon
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getCoupon = getCoupon;
// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin/Seller)
const createCoupon = async (req, res) => {
    try {
        const userRole = req.user.role;
        // If user is seller, assign coupon to them
        if (userRole === User_1.UserRole.SELLER) {
            req.body.seller = req.user._id;
        }
        const existingCoupon = await Coupon_1.Coupon.findOne({ code: req.body.code.toUpperCase() });
        if (existingCoupon) {
            res.status(400).json({ success: false, message: 'Coupon code already exists' });
            return;
        }
        const coupon = await Coupon_1.Coupon.create(req.body);
        res.status(201).json({
            success: true,
            data: coupon
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to create coupon' });
    }
};
exports.createCoupon = createCoupon;
// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin/Seller)
const updateCoupon = async (req, res) => {
    try {
        let coupon = await Coupon_1.Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }
        // Ensure sellers can only update their own coupons
        if (req.user.role === User_1.UserRole.SELLER && coupon.seller?.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this coupon' });
            return;
        }
        coupon = await Coupon_1.Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: coupon
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to update coupon' });
    }
};
exports.updateCoupon = updateCoupon;
// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin/Seller)
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon_1.Coupon.findById(req.params.id);
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Coupon not found' });
            return;
        }
        // Ensure sellers can only delete their own coupons
        if (req.user.role === User_1.UserRole.SELLER && coupon.seller?.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this coupon' });
            return;
        }
        await coupon.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.deleteCoupon = deleteCoupon;
// @desc    Validate and apply coupon
// @route   POST /api/coupons/apply
// @access  Private
const applyCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        if (!code || !cartTotal) {
            res.status(400).json({ success: false, message: 'Please provide coupon code and cart total' });
            return;
        }
        const coupon = await Coupon_1.Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            res.status(404).json({ success: false, message: 'Invalid coupon code' });
            return;
        }
        if (!coupon.isActive) {
            res.status(400).json({ success: false, message: 'Coupon is inactive' });
            return;
        }
        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
            res.status(400).json({ success: false, message: 'Coupon is expired or not yet valid' });
            return;
        }
        if (coupon.usedCount >= coupon.usageLimit) {
            res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
            return;
        }
        if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
            res.status(400).json({
                success: false,
                message: `Minimum order value of $${coupon.minOrderValue} required`
            });
            return;
        }
        let discountAmount = 0;
        if (coupon.discountType === Coupon_1.DiscountType.PERCENTAGE) {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        }
        else {
            discountAmount = coupon.discountValue;
        }
        res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountAmount,
                originalTotal: cartTotal,
                newTotal: Math.max(0, cartTotal - discountAmount)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to apply coupon' });
    }
};
exports.applyCoupon = applyCoupon;
