import express from 'express';
import { handleChat } from '../controllers/chat.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Using optionalAuth so both guests and logged-in users can use the assistant
router.post('/', optionalAuth, handleChat);

export default router;
