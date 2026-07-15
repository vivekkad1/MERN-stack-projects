"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const mongoose_1 = require("mongoose");
// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        let cart = await Cart_1.Cart.findOne({ user: userId }).populate('items.product', 'title basePrice images stock');
        if (!cart) {
            cart = await Cart_1.Cart.create({ user: userId, items: [] });
        }
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCart = getCart;
// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity, variantSku, variantName } = req.body;
        const userId = req.user?.id;
        const product = await Product_1.Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        let cart = await Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart_1.Cart({
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
        }
        else {
            // Product does not exist in cart, add new item
            cart.items.push({
                product: new mongoose_1.Types.ObjectId(productId),
                variantSku,
                variantName,
                quantity,
                priceAtTimeOfAdding: product.discountPrice || product.basePrice
            });
        }
        await cart.save();
        // Return populated cart
        cart = await Cart_1.Cart.findById(cart._id).populate('items.product', 'title basePrice images stock');
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addToCart = addToCart;
// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;
        const userId = req.user?.id;
        const cart = await Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }
        const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);
        if (itemIndex > -1) {
            if (quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
            else {
                cart.items[itemIndex].quantity = quantity;
            }
            await cart.save();
            const updatedCart = await Cart_1.Cart.findById(cart._id).populate('items.product', 'title basePrice images stock');
            res.status(200).json(updatedCart);
        }
        else {
            res.status(404).json({ message: 'Item not found in cart' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateCartItem = updateCartItem;
// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;
        const cart = await Cart_1.Cart.findOne({ user: userId });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        const updatedCart = await Cart_1.Cart.findById(cart._id).populate('items.product', 'title basePrice images stock');
        res.status(200).json(updatedCart);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.removeFromCart = removeFromCart;
// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const userId = req.user?.id;
        const cart = await Cart_1.Cart.findOne({ user: userId });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.status(200).json({ message: 'Cart cleared' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.clearCart = clearCart;
