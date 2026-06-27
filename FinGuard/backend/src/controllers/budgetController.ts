import { Request, Response } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const budgets = await Budget.find({ userId, isActive: true });

    // Recalculate spent amounts for each budget
    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              userId: budget.userId,
              category: budget.category,
              type: 'debit',
              timestamp: { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const spentAmount = spent[0]?.total || 0;
        const progress = (spentAmount / budget.amount) * 100;

        return {
          ...budget.toObject(),
          spent: parseFloat(spentAmount.toFixed(2)),
          progress: parseFloat(Math.min(progress, 100).toFixed(1)),
          remaining: parseFloat(Math.max(budget.amount - spentAmount, 0).toFixed(2)),
          isOverBudget: spentAmount > budget.amount,
          isAlertThresholdReached: progress >= budget.alertThreshold,
        };
      })
    );

    res.status(200).json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { category, amount, period, color, icon, alertThreshold } = req.body;

    // Deactivate existing budget for this category
    await Budget.updateMany({ userId, category, isActive: true }, { isActive: false });

    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const budget = await Budget.create({
      userId,
      category,
      amount: Number(amount),
      period: period || 'monthly',
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate,
      color: color || '#10b981',
      icon: icon || '💰',
      alertThreshold: alertThreshold || 80,
    });

    res.status(201).json(budget);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.status(200).json(budget);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteBudget = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await Budget.findOneAndDelete({ _id: id, userId });
    res.status(200).json({ message: 'Budget deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
