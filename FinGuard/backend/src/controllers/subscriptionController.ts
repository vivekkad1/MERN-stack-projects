import { Request, Response } from 'express';
import { Subscription } from '../models/Subscription';
import { Transaction } from '../models/Transaction';

const KNOWN_SUBSCRIPTIONS = [
  { name: 'Netflix', vendors: ['Netflix'], amount: 15.99, logo: 'https://logo.clearbit.com/netflix.com' },
  { name: 'Spotify', vendors: ['Spotify'], amount: 9.99, logo: 'https://logo.clearbit.com/spotify.com' },
  { name: 'Amazon Prime', vendors: ['Prime', 'Amazon Prime'], amount: 14.99, logo: 'https://logo.clearbit.com/amazon.com' },
  { name: 'Apple iCloud', vendors: ['Apple', 'Apple.com/bill'], amount: 2.99, logo: 'https://logo.clearbit.com/apple.com' },
  { name: 'Google One', vendors: ['Google', 'Google Storage'], amount: 2.99, logo: 'https://logo.clearbit.com/google.com' },
  { name: 'Adobe Creative Cloud', vendors: ['Adobe'], amount: 54.99, logo: 'https://logo.clearbit.com/adobe.com' },
  { name: 'Microsoft 365', vendors: ['Microsoft'], amount: 9.99, logo: 'https://logo.clearbit.com/microsoft.com' },
  { name: 'Disney+', vendors: ['Disney+', 'Disney Plus'], amount: 13.99, logo: 'https://logo.clearbit.com/disneyplus.com' },
  { name: 'Hulu', vendors: ['Hulu'], amount: 17.99, logo: 'https://logo.clearbit.com/hulu.com' },
  { name: 'GitHub', vendors: ['GitHub'], amount: 4.00, logo: 'https://logo.clearbit.com/github.com' },
  { name: 'Slack', vendors: ['Slack'], amount: 8.75, logo: 'https://logo.clearbit.com/slack.com' },
  { name: 'Zoom', vendors: ['Zoom'], amount: 15.99, logo: 'https://logo.clearbit.com/zoom.us' },
  { name: 'Dropbox', vendors: ['Dropbox'], amount: 11.99, logo: 'https://logo.clearbit.com/dropbox.com' },
];

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const subscriptions = await Subscription.find({ userId }).sort({ amount: -1 });
    
    const totalMonthly = subscriptions.filter(s => s.isActive).reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
      return sum;
    }, 0);

    res.status(200).json({
      subscriptions,
      summary: {
        totalMonthly: parseFloat(totalMonthly.toFixed(2)),
        totalYearly: parseFloat((totalMonthly * 12).toFixed(2)),
        activeCount: subscriptions.filter(s => s.isActive).length,
        potentialSavings: parseFloat((totalMonthly * 0.3).toFixed(2)), // 30% savings estimate
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const detectSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Look at transactions in the last 90 days
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const transactions = await Transaction.find({ userId, timestamp: { $gte: ninetyDaysAgo } });

    const detected = [];

    for (const knownSub of KNOWN_SUBSCRIPTIONS) {
      const matches = transactions.filter(t =>
        knownSub.vendors.some(v => t.vendor.toLowerCase().includes(v.toLowerCase()))
      );

      if (matches.length >= 2) {
        // Check if already tracked
        const existing = await Subscription.findOne({ userId, name: knownSub.name });
        if (!existing) {
          const sub = await Subscription.create({
            userId,
            name: knownSub.name,
            vendor: matches[0].vendor,
            amount: knownSub.amount,
            billingCycle: 'monthly',
            logo: knownSub.logo,
            isDetectedAutomatically: true,
            lastChargeDate: matches[matches.length - 1].timestamp,
          });
          detected.push(sub);
        }
      }
    }

    res.status(200).json({ detected, count: detected.length });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const subscription = await Subscription.create({ userId, ...req.body });
    res.status(201).json(subscription);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const sub = await Subscription.findOneAndUpdate({ _id: id, userId }, req.body, { new: true });
    if (!sub) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(sub);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    await Subscription.findOneAndDelete({ _id: id, userId });
    res.status(200).json({ message: 'Subscription deleted' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
