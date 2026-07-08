import { Request, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { FeatureFlag } from '../models/FeatureFlag';

// --- Audit Logs ---

// @desc    Get all audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (Super Admin)
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await AuditLog.find().populate('user', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Feature Flags ---

// @desc    Get all feature flags
// @route   GET /api/admin/feature-flags
// @access  Private (Admin)
export const getFeatureFlags = async (req: Request, res: Response): Promise<void> => {
  try {
    const flags = await FeatureFlag.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: flags.length, data: flags });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a feature flag
// @route   POST /api/admin/feature-flags
// @access  Private (Admin)
export const createFeatureFlag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, isEnabled, description } = req.body;
    
    // Check if flag already exists
    const existing = await FeatureFlag.findOne({ name });
    if (existing) {
        res.status(400).json({ success: false, message: 'Feature flag already exists' });
        return;
    }

    const flag = await FeatureFlag.create({ name, isEnabled, description });

    // Log the action
    await AuditLog.create({
      user: (req as any).user._id,
      action: 'CREATED_FEATURE_FLAG',
      targetResource: flag.name,
      details: { isEnabled }
    });

    res.status(201).json({ success: true, data: flag });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a feature flag
// @route   PUT /api/admin/feature-flags/:id
// @access  Private (Admin)
export const updateFeatureFlag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isEnabled, description } = req.body;
    const flag = await FeatureFlag.findById(req.params.id);

    if (!flag) {
      res.status(404).json({ success: false, message: 'Feature flag not found' });
      return;
    }

    if (isEnabled !== undefined) flag.isEnabled = isEnabled;
    if (description !== undefined) flag.description = description;
    
    await flag.save();

    // Log the action
    await AuditLog.create({
      user: (req as any).user._id,
      action: 'UPDATED_FEATURE_FLAG',
      targetResource: flag.name,
      details: { isEnabled }
    });

    res.status(200).json({ success: true, data: flag });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
