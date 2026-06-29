import { Request, Response } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Types } from 'mongoose';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'title basePrice images stock');
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, quantity, variantSku, variantName } = req.body;
    const userId = (req as any).user?.id;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }

    const itemIndex = cart.items.findIndex(p => {
      const isProductMatch = p.product.toString() === productId;
      if (variantSku) {
        return isProductMatch && p.variantSku === variantSku;
      }
      return isProductMatch;
    });

    if (itemIndex > -1) {
      // Product exists in cart, update quantity
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].priceAtTimeOfAdding = product.discountPrice || product.basePrice; // Update price just in case
    } else {
      // Product does not exist in cart, add new item
      cart.items.push({
        product: new Types.ObjectId(productId),
        variantSku,
        variantName,
        quantity,
        priceAtTimeOfAdding: product.discountPrice || product.basePrice
      });
    }

    await cart.save();
    
    // Return populated cart
    cart = await Cart.findById(cart._id).populate('items.product', 'title basePrice images stock');
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const userId = (req as any).user?.id;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      
      const updatedCart = await Cart.findById(cart._id).populate('items.product', 'title basePrice images stock');
      res.status(200).json(updatedCart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const userId = (req as any).user?.id;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate('items.product', 'title basePrice images stock');
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
