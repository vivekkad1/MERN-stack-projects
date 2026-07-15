"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const cart_controller_1 = require("../controllers/cart.controller");
const router = express_1.default.Router();
// All cart routes are protected
router.use(auth_middleware_1.protect);
router.route('/')
    .get(cart_controller_1.getCart)
    .post(cart_controller_1.addToCart)
    .delete(cart_controller_1.clearCart);
router.route('/:productId')
    .put(cart_controller_1.updateCartItem)
    .delete(cart_controller_1.removeFromCart);
exports.default = router;
