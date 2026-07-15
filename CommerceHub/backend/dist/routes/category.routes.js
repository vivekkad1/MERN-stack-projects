"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Public routes
router.get('/', category_controller_1.getCategories);
// Protected routes (Admin only)
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), category_controller_1.createCategory);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), category_controller_1.deleteCategory);
exports.default = router;
