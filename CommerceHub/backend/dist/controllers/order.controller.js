"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.updateOrderToDelivered = exports.updateOrderToPaid = exports.getOrderById = exports.getMyOrders = exports.addOrderItems = void 0;
const Order_1 = require("../models/Order");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const mongoose_1 = require("mongoose");
const User_1 = require("../models/User");
const socket_1 = require("../socket");
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice, } = req.body;
        const userId = req.user?.id;
        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        }
        // Process each item to check stock and deduct
        for (const item of orderItems) {
            const product = await Product_1.Product.findById(item.product);
            if (!product) {
                res.status(404).json({ message: `Product not found: ${item.product}` });
                return;
            }
            // Check variant stock if applicable
            if (item.variantSku && product.variants && product.variants.length > 0) {
                const variantIndex = product.variants.findIndex(v => v.sku === item.variantSku);
                if (variantIndex > -1) {
                    if (product.variants[variantIndex].stock < item.quantity) {
                        res.status(400).json({ message: `Insufficient stock for variant ${item.variantName}` });
                        return;
                    }
                    product.variants[variantIndex].stock -= item.quantity;
                }
            }
            else {
                // Base stock check
                if (product.stock < item.quantity) {
                    res.status(400).json({ message: `Insufficient stock for ${product.title}` });
                    return;
                }
            }
            // We don't save the product stock here yet, only if the whole order is valid
        }
        // Now save product stock decrements and increment sold count
        for (const item of orderItems) {
            const product = await Product_1.Product.findById(item.product);
            if (product) {
                if (item.variantSku && product.variants) {
                    const variantIndex = product.variants.findIndex(v => v.sku === item.variantSku);
                    if (variantIndex > -1) {
                        product.variants[variantIndex].stock -= item.quantity;
                    }
                }
                product.stock -= item.quantity;
                product.sold += item.quantity;
                await product.save();
            }
        }
        const order = new Order_1.Order({
            user: userId,
            orderItems: orderItems.map((item) => ({
                ...item,
                product: mongoose_1.Types.ObjectId.isValid(item.product)
                    ? new mongoose_1.Types.ObjectId(item.product)
                    : new mongoose_1.Types.ObjectId('000000000000000000000000') // fallback for mock data
            })),
            shippingAddress,
            paymentMethod,
            taxPrice,
            shippingPrice,
            totalPrice,
        });
        const createdOrder = await order.save();
        // Clear user cart after placing order
        await Cart_1.Cart.findOneAndUpdate({ user: userId }, { items: [] });
        res.status(201).json(createdOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addOrderItems = addOrderItems;
// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order_1.Order.find({ user: req.user?.id }).populate('orderItems.product', 'title images basePrice');
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyOrders = getMyOrders;
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id).populate('user', 'name email').populate('orderItems.product', 'title images basePrice');
        if (order) {
            // Check if order belongs to user or user is admin
            if (order.user._id.toString() !== req.user?.id && req.user?.role !== User_1.UserRole.ADMIN && req.user?.role !== User_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ message: 'Not authorized to view this order' });
                return;
            }
            res.status(200).json(order);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrderById = getOrderById;
// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id);
        if (order) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };
            const updatedOrder = await order.save();
            res.status(200).json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderToPaid = updateOrderToPaid;
// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin/Delivery
const updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id);
        if (order) {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.status = 'Delivered';
            const updatedOrder = await order.save();
            // Notify the customer
            (0, socket_1.sendNotificationToUser)(order.user.toString(), 'notification', {
                title: 'Order Delivered!',
                message: `Your order #${order._id.toString().substring(0, 8)} has been delivered.`,
                type: 'success'
            });
            res.status(200).json(updatedOrder);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderToDelivered = updateOrderToDelivered;
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const orders = await Order_1.Order.find({}).populate('user', 'id name');
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getOrders = getOrders;
