import { Request, Response } from 'express';
import { Ticket } from '../models/Ticket';
import { UserRole } from '../models/User';

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, message, priority } = req.body;
    
    const ticket = new Ticket({
      user: (req as any).user._id,
      subject,
      message,
      priority: priority || 'Low'
    });

    const createdTicket = await ticket.save();
    res.status(201).json({ success: true, data: createdTicket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets for logged in user
// @route   GET /api/tickets/my-tickets
// @access  Private
export const getMyTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find({ user: (req as any).user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private (Admin)
export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await Ticket.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tickets.length, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'name email avatarUrl')
      .populate('responses.user', 'name role avatarUrl');
      
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    if (ticket.user._id.toString() !== (req as any).user._id.toString() && 
        (req as any).user.role !== UserRole.ADMIN && 
        (req as any).user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
      return;
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add response to ticket
// @route   POST /api/tickets/:id/responses
// @access  Private
export const addTicketResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    // Ensure authorized
    if (ticket.user.toString() !== (req as any).user._id.toString() && 
        (req as any).user.role !== UserRole.ADMIN && 
        (req as any).user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    ticket.responses.push({
      user: (req as any).user._id,
      message,
      createdAt: new Date()
    });
    
    // Automatically set to In Progress if Admin replies
    if ((req as any).user.role === UserRole.ADMIN || (req as any).user.role === UserRole.SUPER_ADMIN) {
        if(ticket.status === 'Open') ticket.status = 'In Progress';
    }

    await ticket.save();
    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private (Admin)
export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    ticket.status = status;
    await ticket.save();
    
    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
