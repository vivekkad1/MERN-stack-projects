"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignOrder = exports.updateDeliveryStatus = exports.getAssignments = void 0;
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const socket_1 = require("../socket");
// @desc    Get assigned orders for a delivery partner
// @route   GET /api/delivery/assignments
// @access  Private (Delivery Partner)
const getAssignments = async (req, res) => {
    try {
        const deliveryPartnerId = req.user._id;
        // Fetch orders assigned to this delivery partner
        const orders = await Order_1.Order.find({ deliveryPartner: deliveryPartnerId })
            .populate('user', 'name phone')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
exports.getAssignments = getAssignments;
// @desc    Update order status by delivery partner
// @route   PUT /api/delivery/orders/:id/status
// @access  Private (Delivery Partner)
const updateDeliveryStatus = async (req, res) => {
    try {
        const { status, proofOfDelivery } = req.body;
        const deliveryPartnerId = req.user._id;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        if (order.deliveryPartner?.toString() !== deliveryPartnerId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this order' });
            return;
        }
        order.status = status || order.status;
        if (proofOfDelivery) {
            order.proofOfDelivery = proofOfDelivery;
        }
        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }
        await order.save();
        // Notify the customer
        (0, socket_1.sendNotificationToUser)(order.user.toString(), 'notification', {
            title: 'Order Update',
            message: `Your order #${order._id.toString().substring(0, 8)} status is now: ${status}`,
            type: 'info'
        });
        res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to update status' });
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
// @desc    Assign an order to a delivery partner
// @route   PUT /api/delivery/orders/:id/assign
// @access  Private (Admin)
const assignOrder = async (req, res) => {
    try {
        const { deliveryPartnerId } = req.body;
        // Check if user exists and is a delivery partner
        const partner = await User_1.User.findOne({ _id: deliveryPartnerId, role: User_1.UserRole.DELIVERY_PARTNER });
        if (!partner) {
            res.status(404).json({ success: false, message: 'Delivery partner not found or invalid role' });
            return;
        }
        const order = await Order_1.Order.findById(req.params.id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        order.deliveryPartner = deliveryPartnerId;
        order.status = 'Shipped'; // typically assigning means it's shipped/out for delivery soon
        await order.save();
        res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Failed to assign order' });
    }
};
exports.assignOrder = assignOrder;
