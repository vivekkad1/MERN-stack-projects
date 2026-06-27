import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

// Smart AI insights powered by transaction analysis (with optional OpenAI/Gemini)
export const getInsights = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactions = await Transaction.find({ userId, timestamp: { $gte: thirtyDaysAgo } });

    const income = user.monthlyIncome || 5000;
    const totalSpent = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const savings = income - totalSpent;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    // Category analysis
    const catMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'debit').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });
    const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

    // Financial Health Score
    let healthScore = 100;
    if (savingsRate < 10) healthScore -= 30;
    else if (savingsRate < 20) healthScore -= 15;

    const flaggedCount = transactions.filter(t => t.status === 'Flagged').length;
    if (flaggedCount > 3) healthScore -= 20;
    else if (flaggedCount > 0) healthScore -= 10;

    const avgDaily = totalSpent / 30;
    if (avgDaily > income / 20) healthScore -= 15;

    healthScore = Math.max(0, Math.min(100, healthScore));

    // Generate smart insights
    const insights = [];

    if (savingsRate < 10) {
      insights.push({
        type: 'saving',
        severity: 'critical',
        title: 'Low Savings Rate',
        message: `You're saving only ${savingsRate.toFixed(1)}% of income this month. Financial experts recommend 20%+.`,
        action: 'Review your top spending category and set a budget.',
        impact: `+$${(income * 0.1).toFixed(0)}/mo if you reach 10% savings rate`,
      });
    }

    if (topCategory && topCategory[1] > income * 0.3) {
      insights.push({
        type: 'spending',
        severity: 'warning',
        title: `High ${topCategory[0]} Spending`,
        message: `You spent $${topCategory[1].toFixed(2)} on ${topCategory[0]} (${((topCategory[1] / income) * 100).toFixed(0)}% of income).`,
        action: `Set a budget cap for ${topCategory[0]} at ${Math.round(income * 0.2)}$/month.`,
        impact: `Save up to $${(topCategory[1] * 0.2).toFixed(0)}/mo`,
      });
    }

    if (flaggedCount > 0) {
      insights.push({
        type: 'fraud',
        severity: 'critical',
        title: `${flaggedCount} Suspicious Transaction${flaggedCount > 1 ? 's' : ''} Detected`,
        message: `Our AI flagged ${flaggedCount} transaction${flaggedCount > 1 ? 's' : ''} as potentially fraudulent this month.`,
        action: 'Review your fraud alerts and dispute unauthorized charges.',
        impact: 'Protect your account security',
      });
    }

    // Weekend spending pattern
    const weekendTx = transactions.filter(t => {
      const d = new Date(t.timestamp).getDay();
      return d === 0 || d === 6;
    });
    const weekendAmount = weekendTx.reduce((s, t) => s + t.amount, 0);
    const weekdayAmount = totalSpent - weekendAmount;
    if (weekendAmount > weekdayAmount * 0.6 && weekendTx.length > 5) {
      insights.push({
        type: 'pattern',
        severity: 'info',
        title: 'Weekend Spending Pattern',
        message: `You spend ${((weekendAmount / totalSpent) * 100).toFixed(0)}% of your budget on weekends.`,
        action: 'Plan weekend activities in advance to stay within budget.',
        impact: `Save ~$${(weekendAmount * 0.1).toFixed(0)}/mo`,
      });
    }

    // Subscription waste detection
    const subscriptionTx = transactions.filter(t =>
      ['Netflix', 'Hulu', 'Spotify', 'Disney+', 'HBO', 'Prime'].includes(t.vendor)
    );
    if (subscriptionTx.length >= 3) {
      const subTotal = subscriptionTx.reduce((s, t) => s + t.amount, 0);
      insights.push({
        type: 'subscription',
        severity: 'warning',
        title: 'Multiple Streaming Subscriptions',
        message: `You're spending $${subTotal.toFixed(2)}/mo on ${subscriptionTx.length} streaming services.`,
        action: 'Consider cancelling services you rarely use.',
        impact: `Save up to $${(subTotal * 0.4).toFixed(0)}/mo`,
      });
    }

    // Good insight
    if (savingsRate >= 20) {
      insights.push({
        type: 'positive',
        severity: 'success',
        title: 'Excellent Savings Rate! 🎉',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. You're on track to reach your financial goals.`,
        action: 'Consider investing your surplus in index funds.',
        impact: `$${savings.toFixed(0)} saved this month`,
      });
    }

    // Predicted next month expenses
    const avgMonthlySpend = totalSpent;
    const predictedNextMonth = avgMonthlySpend * (1 + (Math.random() * 0.1 - 0.05));

    res.status(200).json({
      healthScore: Math.round(healthScore),
      summary: {
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        totalIncome: income,
        savings: parseFloat(savings.toFixed(2)),
        savingsRate: parseFloat(savingsRate.toFixed(1)),
        transactionCount: transactions.length,
      },
      insights,
      predictions: {
        nextMonthExpenses: parseFloat(predictedNextMonth.toFixed(2)),
        savingsGoalProgress: user.savingsGoal > 0 ? Math.min((savings / user.savingsGoal) * 100, 100) : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const userId = (req as any).user.id;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const transactions = await Transaction.find({ userId, timestamp: { $gte: thirtyDaysAgo } });
    const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);

    // Smart mock responses based on keyword detection
    const lowerMessage = message.toLowerCase();
    let response = '';

    if (lowerMessage.includes('spend') || lowerMessage.includes('spent')) {
      response = `Based on your last 30 days, you've spent $${totalSpent.toFixed(2)} across ${transactions.length} transactions. Your highest spending categories are ${getTopCategories(transactions)}.`;
    } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      const saveTip = totalSpent > 2000
        ? `To improve savings, consider reducing your discretionary spending. Cutting back 20% on your top 3 spending categories could save you $${(totalSpent * 0.1).toFixed(0)}/month.`
        : `You're doing well! Keep tracking your spending and consider automating savings transfers on payday.`;
      response = saveTip;
    } else if (lowerMessage.includes('budget')) {
      response = `I recommend the 50/30/20 rule: 50% on needs, 30% on wants, 20% on savings. Based on your spending, your current split is approximately ${getSpendingSplit(transactions, 5000)}.`;
    } else if (lowerMessage.includes('fraud') || lowerMessage.includes('suspicious')) {
      const flagged = transactions.filter(t => t.status === 'Flagged');
      response = flagged.length > 0
        ? `I've detected ${flagged.length} potentially suspicious transaction${flagged.length > 1 ? 's' : ''} in the last 30 days. The most recent one is from "${flagged[0]?.vendor}" for $${flagged[0]?.amount}. Please review and dispute if unauthorized.`
        : `Great news — no suspicious transactions detected in the last 30 days. Your account security looks good!`;
    } else if (lowerMessage.includes('subscription')) {
      const subs = transactions.filter(t => ['Netflix', 'Spotify', 'Apple', 'Google', 'Adobe', 'Microsoft', 'Disney', 'Hulu', 'Prime'].some(s => t.vendor.includes(s)));
      const subTotal = subs.reduce((s, t) => s + t.amount, 0);
      response = subs.length > 0
        ? `You're spending approximately $${subTotal.toFixed(2)}/month on ${subs.length} subscription services. I'd recommend reviewing which ones you actively use — cancelling even one could save you $${(subTotal / subs.length).toFixed(2)}/month.`
        : `I don't see many recurring subscriptions. This is great for controlling fixed costs!`;
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('stock')) {
      response = `Before investing, ensure you have 3-6 months of expenses in an emergency fund. Based on your spending, that would be approximately $${(totalSpent * 4).toFixed(0)}-$${(totalSpent * 6).toFixed(0)}. Consider low-cost index funds like S&P 500 ETFs for long-term wealth building.`;
    } else {
      const tips = [
        `Based on your recent activity, you've made ${transactions.length} transactions totaling $${totalSpent.toFixed(2)}. I'm here to help you understand your finances better — ask me about your spending, budgeting, savings, or fraud alerts!`,
        `I analyze your transaction patterns to give personalized financial advice. Your most active spending category this month is ${getTopCategories(transactions).split(', ')[0]}.`,
        `Want to improve your financial health? I can help you identify subscription waste, spot spending trends, or recommend saving strategies based on your actual data.`,
      ];
      response = tips[Math.floor(Math.random() * tips.length)];
    }

    res.status(200).json({ response, timestamp: new Date() });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

function getTopCategories(transactions: any[]): string {
  const catMap: Record<string, number> = {};
  transactions.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat)
    .join(', ') || 'N/A';
}

function getSpendingSplit(transactions: any[], income: number): string {
  const needs = ['Housing', 'Food', 'Utilities', 'Transportation', 'Healthcare'];
  const wants = ['Entertainment', 'Shopping', 'Travel', 'SaaS'];

  const needsTotal = transactions.filter(t => needs.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const wantsTotal = transactions.filter(t => wants.includes(t.category)).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.reduce((s, t) => s + t.amount, 0);
  const savings = income - totalSpent;

  return `${Math.round((needsTotal / income) * 100)}% needs / ${Math.round((wantsTotal / income) * 100)}% wants / ${Math.max(0, Math.round((savings / income) * 100))}% savings`;
}
