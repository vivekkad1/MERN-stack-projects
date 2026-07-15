"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.addTicketResponse = exports.getTicketById = exports.getTickets = exports.getMyTickets = exports.createTicket = void 0;
const Ticket_1 = require("../models/Ticket");
const User_1 = require("../models/User");
// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const ticket = new Ticket_1.Ticket({
            user: req.user._id,
            subject,
            message,
            priority: priority || 'Low'
        });
        const createdTicket = await ticket.save();
        res.status(201).json({ success: true, data: createdTicket });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createTicket = createTicket;
// @desc    Get all tickets for logged in user
// @route   GET /api/tickets/my-tickets
// @access  Private
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket_1.Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyTickets = getMyTickets;
// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private (Admin)
const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket_1.Ticket.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTickets = getTickets;
// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket_1.Ticket.findById(req.params.id)
            .populate('user', 'name email avatarUrl')
            .populate('responses.user', 'name role avatarUrl');
        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }
        if (ticket.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== User_1.UserRole.ADMIN &&
            req.user.role !== User_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
            return;
        }
        res.status(200).json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTicketById = getTicketById;
// @desc    Add response to ticket
// @route   POST /api/tickets/:id/responses
// @access  Private
const addTicketResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await Ticket_1.Ticket.findById(req.params.id);
        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }
        // Ensure authorized
        if (ticket.user.toString() !== req.user._id.toString() &&
            req.user.role !== User_1.UserRole.ADMIN &&
            req.user.role !== User_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        ticket.responses.push({
            user: req.user._id,
            message,
            createdAt: new Date()
        });
        // Automatically set to In Progress if Admin replies
        if (req.user.role === User_1.UserRole.ADMIN || req.user.role === User_1.UserRole.SUPER_ADMIN) {
            if (ticket.status === 'Open')
                ticket.status = 'In Progress';
        }
        await ticket.save();
        res.status(201).json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.addTicketResponse = addTicketResponse;
// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private (Admin)
const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const ticket = await Ticket_1.Ticket.findById(req.params.id);
        if (!ticket) {
            res.status(404).json({ success: false, message: 'Ticket not found' });
            return;
        }
        ticket.status = status;
        await ticket.save();
        res.status(200).json({ success: true, data: ticket });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateTicketStatus = updateTicketStatus;
