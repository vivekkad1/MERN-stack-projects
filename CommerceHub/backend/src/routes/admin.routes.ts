import express from 'express';
import { getAdminStats, getAllUsers, updateUserRole } from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

// All routes require ADMIN role
router.use(protect);
router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
