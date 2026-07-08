import express from 'express';
import {
  getAuditLogs,
  getFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag
} from '../controllers/admin.features.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

// Audit Logs
router.get('/audit-logs', authorize(UserRole.SUPER_ADMIN), getAuditLogs);

// Feature Flags
router.route('/feature-flags')
  .get(getFeatureFlags)
  .post(createFeatureFlag);

router.route('/feature-flags/:id')
  .put(updateFeatureFlag);

export default router;
