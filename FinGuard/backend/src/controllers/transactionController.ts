import { Request, Response } from 'express';
import { Transaction, ITransaction } from '../models/Transaction';
import { Notification } from '../models/Notification';
import { Budget } from '../models/Budget';

// ─────────────────────────────────────────────
// Fraud Detection Engine
// ─────────────────────────────────────────────

interface FraudAnalysis {
  isFlagged: boolean;
  riskScore: number;
  reasons: string[];
}

async function analyzeFraud(
  userId: string,
  vendor: string,
  amount: number,
  category: string,
  latitude?: number,
  longitude?: number
): Promise<FraudAnalysis> {
  const reasons: string[] = [];
  let riskScore = 0;

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [recentMinute, recentHour, recentDay] = await Promise.all([
    Transaction.find({ userId, timestamp: { $gte: oneMinuteAgo } }),
    Transaction.find({ userId, timestamp: { $gte: oneHourAgo } }),
    Transaction.find({ userId, timestamp: { $gte: oneDayAgo } }),
  ]);

  // 1. Duplicate Charge Detection (same vendor + amount within 60s)
  const duplicate = recentMinute.some(t => t.vendor === vendor && t.amount === amount);
  if (duplicate) {
    reasons.push('Duplicate charge detected — same vendor and amount within 60 seconds');
    riskScore += 45;
  }

  // 2. Velocity Attack (> 5 transactions in last minute)
  if (recentMinute.length >= 5) {
    reasons.push(`Velocity attack detected — ${recentMinute.length} transactions in 60 seconds`);
    riskScore += 35;
  }

  // 3. Rapid Succession (> 10 transactions in last hour)
  if (recentHour.length >= 10) {
    reasons.push(`Rapid succession — ${recentHour.length} transactions in the last hour`);
    riskScore += 20;
  }

  // 4. Abnormal Amount (> 3x the average transaction amount)
  if (recentDay.length >= 3) {
    const avgAmount = recentDay.reduce((s, t) => s + t.amount, 0) / recentDay.length;
    if (amount > avgAmount * 3 && amount > 200) {
      reasons.push(`Abnormal spending — $${amount.toFixed(2)} is ${(amount / avgAmount).toFixed(1)}x your daily average`);
      riskScore += 25;
    }
  }

  // 5. Night-time Spending (11 PM – 5 AM)
  const hour = now.getHours();
  if (hour >= 23 || hour < 5) {
    reasons.push('Night-time transaction detected (11 PM – 5 AM)');
    riskScore += 15;
  }

  // 6. Merchant Frequency Spike (> 3 charges from same vendor today)
  const vendorToday = recentDay.filter(t => t.vendor === vendor);
  if (vendorToday.length >= 3) {
    reasons.push(`Merchant frequency spike — ${vendorToday.length + 1} charges from "${vendor}" today`);
    riskScore += 20;
  }

  // 7. High-value transaction (> $500)
  if (amount > 500) {
    reasons.push(`High-value transaction — $${amount.toFixed(2)}`);
    riskScore += 10;
  }

  // 8. Unusual Category (gambling, crypto, etc.)
  const unusualCategories = ['Investment'];
  if (unusualCategories.includes(category) && amount > 300) {
    reasons.push(`Unusual high-risk category: ${category}`);
    riskScore += 15;
  }

  const finalScore = Math.min(riskScore, 100);
  const isFlagged = finalScore >= 40 || reasons.length >= 2;

  return { isFlagged, riskScore: finalScore, reasons };
}

// ─────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { vendor, amount, category, notes, tags, location, latitude, longitude, currency, paymentMethod, type } = req.body;
    const userId = (req as any).user.id;

    const fraud = await analyzeFraud(userId, vendor, Number(amount), category, latitude, longitude);

    // Merchant logo via Clearbit
    const domainMap: Record<string, string> = {
      'Amazon': 'amazon.com', 'Netflix': 'netflix.com', 'Spotify': 'spotify.com',
      'Apple': 'apple.com', 'Google': 'google.com', 'Starbucks': 'starbucks.com',
      'Uber': 'uber.com', 'Lyft': 'lyft.com', 'DoorDash': 'doordash.com',
      'Airbnb': 'airbnb.com', 'Adobe': 'adobe.com', 'Microsoft': 'microsoft.com',
      'GitHub': 'github.com', 'Slack': 'slack.com', 'Zoom': 'zoom.us',
      'Dropbox': 'dropbox.com', 'Twitter': 'twitter.com', 'Facebook': 'facebook.com',
      'LinkedIn': 'linkedin.com', 'YouTube': 'youtube.com', 'Disney+': 'disneyplus.com',
      'Hulu': 'hulu.com', 'HBO': 'hbo.com', 'Prime': 'amazon.com',
    };
    const domain = domainMap[vendor] || `${vendor.toLowerCase().replace(/\s+/g, '')}.com`;
    const merchantLogo = `https://logo.clearbit.com/${domain}`;

    const transaction = new Transaction({
      userId,
      vendor,
      amount: Number(amount),
      category,
      status: fraud.isFlagged ? 'Flagged' : 'Cleared',
      riskScore: fraud.riskScore,
      fraudReasons: fraud.reasons,
      notes: notes || '',
      tags: tags || [],
      location: location || '',
      latitude,
      longitude,
      merchantLogo,
      currency: currency || 'USD',
      paymentMethod: paymentMethod || 'card',
      type: type || 'debit',
    });

    await transaction.save();

    // If flagged, create a notification
    if (fraud.isFlagged) {
      await Notification.create({
        userId,
        title: 'Fraud Alert Detected',
        message: `Suspicious activity on "${vendor}" — ${fraud.reasons[0]}`,
        type: 'fraud_alert',
        severity: fraud.riskScore >= 70 ? 'critical' : 'warning',
        data: { transactionId: transaction._id, riskScore: fraud.riskScore },
      });
    }

    // Update budget spent amount
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    await Budget.findOneAndUpdate(
      { userId, category, isActive: true, startDate: { $lte: now }, $or: [{ endDate: { $gte: now } }, { endDate: null }] },
      { $inc: { spent: Number(amount) } }
    );

    res.status(201).json({
      transaction,
      triggerAlert: fraud.isFlagged,
      fraudAnalysis: fraud,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      page = '1',
      limit = '20',
      search = '',
      category,
      status,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      type,
    } = req.query as Record<string, string>;

    const query: Record<string, any> = { userId };

    if (search) {
      query.$or = [
        { vendor: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortDir };

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sort).skip(skip).limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.status(200).json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const updates = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const result = await Transaction.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ message: 'Transaction not found' });

    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const bulkDeleteTransactions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { ids } = req.body as { ids: string[] };

    const result = await Transaction.deleteMany({ _id: { $in: ids }, userId });
    res.status(200).json({ message: `${result.deletedCount} transactions deleted` });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const transaction = await Transaction.findOne({ _id: id, userId });
    if (!transaction) return res.status(404).json({ message: 'Not found' });

    transaction.isFavorite = !transaction.isFavorite;
    await transaction.save();

    res.status(200).json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const bulkSimulate = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const vendors = [
      { vendor: 'Amazon', category: 'Shopping', amount: 89.99 },
      { vendor: 'Netflix', category: 'Entertainment', amount: 15.99 },
      { vendor: 'Spotify', category: 'Entertainment', amount: 9.99 },
      { vendor: 'Uber', category: 'Transportation', amount: 24.50 },
      { vendor: 'Starbucks', category: 'Food', amount: 6.75 },
      { vendor: 'Google', category: 'SaaS', amount: 9.99 },
      { vendor: 'Adobe', category: 'SaaS', amount: 54.99 },
      { vendor: 'DoorDash', category: 'Food', amount: 38.20 },
      { vendor: 'Airbnb', category: 'Travel', amount: 320.00 },
      { vendor: 'Apple', category: 'SaaS', amount: 14.99 },
      { vendor: 'Microsoft', category: 'SaaS', amount: 9.99 },
      { vendor: 'Amazon', category: 'Shopping', amount: 89.99 }, // duplicate trigger
      { vendor: 'Starbucks', category: 'Food', amount: 8.50 },
      { vendor: 'Amazon', category: 'Shopping', amount: 145.00 },
      { vendor: 'Lyft', category: 'Transportation', amount: 18.75 },
    ];

    const created: typeof Transaction.prototype[] = [];
    for (const item of vendors) {
      const domainMap: Record<string, string> = {
        'Amazon': 'amazon.com', 'Netflix': 'netflix.com', 'Spotify': 'spotify.com',
        'Apple': 'apple.com', 'Google': 'google.com', 'Starbucks': 'starbucks.com',
        'Uber': 'uber.com', 'Lyft': 'lyft.com', 'DoorDash': 'doordash.com',
        'Airbnb': 'airbnb.com', 'Adobe': 'adobe.com', 'Microsoft': 'microsoft.com',
      };
      const domain = domainMap[item.vendor] || `${item.vendor.toLowerCase()}.com`;
      const fraud = await analyzeFraud(userId, item.vendor, item.amount, item.category);

      const t = await Transaction.create({
        userId,
        vendor: item.vendor,
        amount: item.amount,
        category: item.category as 'Housing' | 'Food' | 'Entertainment' | 'Utilities' | 'SaaS' | 'Transportation' | 'Healthcare' | 'Shopping' | 'Travel' | 'Education' | 'Investment' | 'Misc',
        merchantLogo: `https://logo.clearbit.com/${domain}`,
        status: fraud.isFlagged ? 'Flagged' : 'Cleared',
        riskScore: fraud.riskScore,
        fraudReasons: fraud.reasons,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      });
      created.push(t);
    }

    res.status(201).json({ transactions: created, count: created.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
