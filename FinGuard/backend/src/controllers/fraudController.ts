import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';

// Get fraud overview + stats
export const getFraudOverview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [flagged, all] = await Promise.all([
      Transaction.find({ userId, status: 'Flagged' }).sort({ timestamp: -1 }).limit(50),
      Transaction.find({ userId }).sort({ timestamp: -1 }),
    ]);

    const totalRiskScore = flagged.length > 0
      ? Math.round(flagged.reduce((s, t) => s + t.riskScore, 0) / flagged.length)
      : 0;

    // Pattern breakdown
    const patterns = {
      duplicateCharges: flagged.filter(t => t.fraudReasons.some(r => r.includes('Duplicate'))).length,
      velocityAttacks: flagged.filter(t => t.fraudReasons.some(r => r.includes('Velocity'))).length,
      nightTimeSpending: flagged.filter(t => t.fraudReasons.some(r => r.includes('Night'))).length,
      abnormalAmount: flagged.filter(t => t.fraudReasons.some(r => r.includes('Abnormal'))).length,
      merchantFrequency: flagged.filter(t => t.fraudReasons.some(r => r.includes('frequency'))).length,
      highValue: flagged.filter(t => t.fraudReasons.some(r => r.includes('High-value'))).length,
      unusualCategory: flagged.filter(t => t.fraudReasons.some(r => r.includes('category'))).length,
    };

    // Heatmap data: transactions per hour of day per day of week
    const heatmapData: { hour: number; day: number; count: number }[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const count = all.filter(t => {
          const d = new Date(t.timestamp);
          return d.getDay() === day && d.getHours() === hour;
        }).length;
        if (count > 0) heatmapData.push({ hour, day, count });
      }
    }

    res.status(200).json({
      flaggedTransactions: flagged,
      stats: {
        total: all.length,
        flagged: flagged.length,
        flaggedPercent: all.length > 0 ? ((flagged.length / all.length) * 100).toFixed(1) : '0',
        avgRiskScore: totalRiskScore,
        totalFraudAmount: flagged.reduce((s, t) => s + t.amount, 0),
      },
      patterns,
      heatmap: heatmapData,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getRiskTimeline = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const days = 30;

    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));

      const dayTransactions = await Transaction.find({
        userId,
        timestamp: { $gte: start, $lte: end },
      });

      const avgRisk = dayTransactions.length > 0
        ? Math.round(dayTransactions.reduce((s, t) => s + t.riskScore, 0) / dayTransactions.length)
        : 0;

      results.push({
        date: start.toISOString().split('T')[0],
        riskScore: avgRisk,
        flagged: dayTransactions.filter(t => t.status === 'Flagged').length,
        total: dayTransactions.length,
      });
    }

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
