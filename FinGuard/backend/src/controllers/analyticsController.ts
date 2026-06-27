import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = '30' } = req.query as { period?: string };
    const days = parseInt(period, 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const transactions = await Transaction.find({
      userId,
      timestamp: { $gte: startDate },
      type: 'debit',
    }).sort({ timestamp: 1 });

    // Daily spending trend
    const dailyMap: Record<string, number> = {};
    transactions.forEach(t => {
      const day = new Date(t.timestamp).toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + t.amount;
    });

    const spendingTrend = Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2)),
    }));

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    transactions.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);

    // Monthly comparison (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      const monthStart = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() - i + 1, 0);
      const monthName = monthStart.toLocaleString('default', { month: 'short' });

      const [debits, credits] = await Promise.all([
        Transaction.find({ userId, timestamp: { $gte: monthStart, $lte: monthEnd }, type: 'debit' }),
        Transaction.find({ userId, timestamp: { $gte: monthStart, $lte: monthEnd }, type: 'credit' }),
      ]);

      monthlyData.push({
        month: monthName,
        expenses: parseFloat(debits.reduce((s, t) => s + t.amount, 0).toFixed(2)),
        income: parseFloat(credits.reduce((s, t) => s + t.amount, 0).toFixed(2)),
      });
    }

    // Top merchants
    const merchantMap: Record<string, { amount: number; count: number; logo: string }> = {};
    transactions.forEach(t => {
      if (!merchantMap[t.vendor]) merchantMap[t.vendor] = { amount: 0, count: 0, logo: t.merchantLogo };
      merchantMap[t.vendor].amount += t.amount;
      merchantMap[t.vendor].count++;
    });
    const topMerchants = Object.entries(merchantMap)
      .map(([name, data]) => ({ name, ...data, amount: parseFloat(data.amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Summary stats
    const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
    const avgDailySpend = days > 0 ? totalSpent / days : 0;

    res.status(200).json({
      spendingTrend,
      categoryBreakdown,
      monthlyData,
      topMerchants,
      summary: {
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        avgDailySpend: parseFloat(avgDailySpend.toFixed(2)),
        transactionCount: transactions.length,
        topCategory: categoryBreakdown[0]?.name || 'N/A',
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getCashFlow = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const months = 6;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const all = await Transaction.find({ userId, timestamp: { $gte: start, $lte: end } });
      const income = all.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const expenses = all.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

      data.push({
        month: start.toLocaleString('default', { month: 'short' }),
        income: parseFloat(income.toFixed(2)),
        expenses: parseFloat(expenses.toFixed(2)),
        net: parseFloat((income - expenses).toFixed(2)),
      });
    }

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
