"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const delivery_controller_1 = require("../controllers/delivery.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
// Delivery Partner routes
router.get('/assignments', (0, auth_middleware_1.authorize)(User_1.UserRole.DELIVERY_PARTNER), delivery_controller_1.getAssignments);
router.put('/orders/:id/status', (0, auth_middleware_1.authorize)(User_1.UserRole.DELIVERY_PARTNER), delivery_controller_1.updateDeliveryStatus);
// Admin routes for assigning
router.put('/orders/:id/assign', (0, auth_middleware_1.authorize)(User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), delivery_controller_1.assignOrder);
exports.default = router;
