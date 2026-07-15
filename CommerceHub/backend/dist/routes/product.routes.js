"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product.controller");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const User_1 = require("../models/User");
const router = express_1.default.Router();
// Public routes
router.get('/', product_controller_1.getProducts);
// Protected suggestions route (must be before /:idOrSlug)
router.get('/suggestions', auth_middleware_1.optionalAuth, product_controller_1.getSuggestions);
// Inventory routes (must be before /:idOrSlug)
router.get('/inventory/low-stock', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), product_controller_1.getLowStock);
router.put('/inventory/bulk-update', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), product_controller_1.bulkUpdateInventory);
router.get('/:idOrSlug', product_controller_1.getProductById);
router.get('/:productId/reviews', review_controller_1.getProductReviews);
// Protected routes (Customer)
router.post('/:productId/reviews', auth_middleware_1.protect, review_controller_1.createReview);
// Protected routes (Seller / Admin)
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), product_controller_1.deleteProduct);
router.patch('/:id/inventory', auth_middleware_1.protect, (0, auth_middleware_1.authorize)(User_1.UserRole.SELLER, User_1.UserRole.ADMIN, User_1.UserRole.SUPER_ADMIN), product_controller_1.updateInventory);
exports.default = router;
