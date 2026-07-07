import express from 'express';
import {
  createTicket,
  getMyTickets,
  getTickets,
  getTicketById,
  addTicketResponse,
  updateTicketStatus
} from '../controllers/ticket.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTicket)
  .get(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getTickets);

router.get('/my-tickets', getMyTickets);

router.route('/:id')
  .get(getTicketById);

router.post('/:id/responses', addTicketResponse);

router.put('/:id/status', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateTicketStatus);

export default router;
