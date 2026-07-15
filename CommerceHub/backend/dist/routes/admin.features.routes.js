"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_features_controller_1 = require("../controllers/admin.features.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN));
// Audit Logs
router.get('/audit-logs', (0, auth_middleware_1.authorize)(User_1.UserRole.SUPER_ADMIN), admin_features_controller_1.getAuditLogs);
// Feature Flags
router.route('/feature-flags')
    .get(admin_features_controller_1.getFeatureFlags)
    .post(admin_features_controller_1.createFeatureFlag);
router.route('/feature-flags/:id')
    .put(admin_features_controller_1.updateFeatureFlag);
exports.default = router;
