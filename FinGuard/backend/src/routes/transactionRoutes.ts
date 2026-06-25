import express from 'express';
import { createTransaction, getTransactions } from '../controllers/transactionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .post(protect, createTransaction)
  .get(protect, getTransactions);

export default router;
