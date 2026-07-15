"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// All routes require ADMIN role
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN));
router.get('/stats', admin_controller_1.getAdminStats);
router.get('/users', admin_controller_1.getAllUsers);
router.put('/users/:id/role', admin_controller_1.updateUserRole);
exports.default = router;
