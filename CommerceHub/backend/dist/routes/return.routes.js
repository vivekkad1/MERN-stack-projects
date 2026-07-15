"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const return_controller_1 = require("../controllers/return.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_middleware_1.protect);
// Customer routes
router.post('/', return_controller_1.createReturn);
router.get('/myreturns', return_controller_1.getMyReturns);
// Admin & Seller routes
router.get('/', (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), return_controller_1.getReturns);
router.put('/:id/status', (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), return_controller_1.updateReturnStatus);
exports.default = router;
