import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { vendor, amount, category } = req.body;
    const userId = (req as any).user.id;

    // 1. Scan the database collections for entries belonging to the matching userId that occurred within the past 60 seconds.
    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
    const recentTransactions = await Transaction.find({
      userId,
      timestamp: { $gte: sixtySecondsAgo }
    });

    let isFlagged = false;

    // 2. If an entry is found matching the exact same vendor and identical amount, automatically set the incoming payload status to 'Flagged'.
    const duplicateFound = recentTransactions.some(
      t => t.vendor === vendor && t.amount === amount
    );

    if (duplicateFound) {
      isFlagged = true;
    }

    const transaction = new Transaction({
      userId,
      vendor,
      amount,
      category,
      status: isFlagged ? 'Flagged' : 'Cleared'
    });

    await transaction.save();

    // 3. Deliver the response with a status code 201 Created along with an added custom boolean property triggerAlert: true.
    res.status(201).json({
      transaction,
      triggerAlert: isFlagged
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await Transaction.find({ userId }).sort({ timestamp: -1 });
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
