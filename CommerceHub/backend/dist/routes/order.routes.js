"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
router.route('/')
    .post(auth_middleware_1.protect, order_controller_1.addOrderItems)
    .get(auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), order_controller_1.getOrders);
router.route('/myorders').get(auth_middleware_1.protect, order_controller_1.getMyOrders);
router.route('/:id').get(auth_middleware_1.protect, order_controller_1.getOrderById);
router.route('/:id/pay').put(auth_middleware_1.protect, order_controller_1.updateOrderToPaid);
router.route('/:id/deliver').put(auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN, User_1.UserRole.DELIVERY_PARTNER), order_controller_1.updateOrderToDelivered);
exports.default = router;
