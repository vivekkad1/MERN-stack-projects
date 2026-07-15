"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const seller_controller_1 = require("../controllers/seller.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// All routes require SELLER role
router.use(auth_middleware_1.protect);
router.use((0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN));
router.get('/stats', seller_controller_1.getSellerStats);
router.get('/orders', seller_controller_1.getSellerOrders);
router.get('/products', seller_controller_1.getSellerProducts);
exports.default = router;
