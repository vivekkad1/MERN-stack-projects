import express from 'express';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  bulkDeleteTransactions,
  toggleFavorite,
  bulkSimulate,
} from '../controllers/transactionController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
  .post(protect, createTransaction)
  .get(protect, getTransactions);

router.route('/bulk-delete').post(protect, bulkDeleteTransactions);
router.route('/simulate').post(protect, bulkSimulate);

router.route('/:id')
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

router.route('/:id/favorite').patch(protect, toggleFavorite);

export default router;
