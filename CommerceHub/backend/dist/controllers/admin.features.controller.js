"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeatureFlag = exports.createFeatureFlag = exports.getFeatureFlags = exports.getAuditLogs = void 0;
const AuditLog_1 = require("../models/AuditLog");
const FeatureFlag_1 = require("../models/FeatureFlag");
// --- Audit Logs ---
// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Super Admin)
const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog_1.AuditLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
        res.status(200).json({ success: true, count: logs.length, data: logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAuditLogs = getAuditLogs;
// --- Feature Flags ---
// @desc    Get all feature flags
// @route   GET /api/admin/feature-flags
// @access  Private (Admin)
const getFeatureFlags = async (req, res) => {
    try {
        const flags = await FeatureFlag_1.FeatureFlag.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: flags.length, data: flags });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getFeatureFlags = getFeatureFlags;
// @desc    Create a feature flag
// @route   POST /api/admin/feature-flags
// @access  Private (Admin)
const createFeatureFlag = async (req, res) => {
    try {
        const { name, isEnabled, description } = req.body;
        // Check if flag already exists
        const existing = await FeatureFlag_1.FeatureFlag.findOne({ name });
        if (existing) {
            res.status(400).json({ success: false, message: 'Feature flag already exists' });
            return;
        }
        const flag = await FeatureFlag_1.FeatureFlag.create({ name, isEnabled, description });
        // Log the action
        await AuditLog_1.AuditLog.create({
            user: req.user._id,
            action: 'CREATED_FEATURE_FLAG',
            targetResource: flag.name,
            details: { isEnabled }
        });
        res.status(201).json({ success: true, data: flag });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createFeatureFlag = createFeatureFlag;
// @desc    Update a feature flag
// @route   PUT /api/admin/feature-flags/:id
// @access  Private (Admin)
const updateFeatureFlag = async (req, res) => {
    try {
        const { isEnabled, description } = req.body;
        const flag = await FeatureFlag_1.FeatureFlag.findById(req.params.id);
        if (!flag) {
            res.status(404).json({ success: false, message: 'Feature flag not found' });
            return;
        }
        if (isEnabled !== undefined)
            flag.isEnabled = isEnabled;
        if (description !== undefined)
            flag.description = description;
        await flag.save();
        // Log the action
        await AuditLog_1.AuditLog.create({
            user: req.user._id,
            action: 'UPDATED_FEATURE_FLAG',
            targetResource: flag.name,
            details: { isEnabled }
        });
        res.status(200).json({ success: true, data: flag });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateFeatureFlag = updateFeatureFlag;
