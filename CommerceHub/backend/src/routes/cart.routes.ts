import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.controller';

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;
