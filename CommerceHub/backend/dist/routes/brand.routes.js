"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brand_controller_1 = require("../controllers/brand.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Public routes
router.get('/', brand_controller_1.getBrands);
// Protected routes (Admin only)
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), brand_controller_1.createBrand);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), brand_controller_1.updateBrand);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), brand_controller_1.deleteBrand);
exports.default = router;
