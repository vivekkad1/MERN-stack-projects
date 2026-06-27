'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Shield, Brain, Zap,
  ArrowUpRight, ArrowDownRight, CreditCard, Target, MoreHorizontal, RefreshCw,
  ShieldAlert, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function MetricCard({ title, value, change, changeLabel, icon: Icon, iconColor, trend, loading }: {
  title: string; value: string; change?: number; changeLabel?: string;
  icon: React.ElementType; iconColor: string; trend?: 'up' | 'down' | 'neutral'; loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-5 border border-white/8 card-hover"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon size={17} />
        </div>
      </div>
      {loading ? (
        <div className="skeleton h-8 w-28 mb-2 rounded-lg" />
      ) : (
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
      )}
      {change !== undefined && !loading && (
        <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : null}
          <span>{Math.abs(change).toFixed(1)}% {changeLabel}</span>
        </div>
      )}
    </motion.div>
  );
}

function TransactionRow({ t, index }: { t: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/4 transition-colors group"
    >
      {/* Merchant logo / icon */}
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/8 shrink-0">
        {t.merchantLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.merchantLogo}
            alt={t.vendor}
            className="w-7 h-7 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <CreditCard size={16} className="text-gray-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{t.vendor}</p>
        <p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${t.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
          {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
        </p>
        {t.status === 'Flagged' ? (
          <span className="text-xs text-red-400 flex items-center justify-end gap-1">
            <ShieldAlert size={10} />Flagged
          </span>
        ) : (
          <span className="text-xs text-gray-500">{t.category}</span>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, transactions, setTransactions, budgets, setBudgets, alerts } = useStore();
  const [marketData, setMarketData] = useState<any[]>([]);

  // Transactions query
  const { isLoading: txLoading } = useQuery({
    queryKey: ['transactions', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/transactions?limit=50&sortBy=timestamp&sortOrder=desc');
      setTransactions(data.transactions || []);
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Analytics query
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics?period=30');
      return data;
    },
    enabled: !!user,
  });

  // Budgets query
  useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await api.get('/budgets');
      setBudgets(data);
      return data;
    },
    enabled: !!user,
  });

  // AI insights
  const { data: insights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data } = await api.get('/ai/insights');
      return data;
    },
    enabled: !!user,
  });

  // Market data
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const { data } = await api.get('/market/mock');
        setMarketData(data.markets || []);
      } catch { /* silent */ }
    };
    fetchMarket();
    const timer = setInterval(fetchMarket, 60000);
    return () => clearInterval(timer);
  }, []);

  // Derived metrics
  const income = user?.monthlyIncome || 5000;
  const totalSpent = transactions.filter(t => t.type !== 'credit').reduce((s, t) => s + t.amount, 0);
  const totalBalance = income - totalSpent;
  const savings = Math.max(0, income * 0.2); // 20% savings goal
  const flaggedCount = transactions.filter(t => t.status === 'Flagged').length;
  const budgetUsed = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;

  const categoryData = analyticsData?.categoryBreakdown?.slice(0, 6) || [];
  const spendingTrend = analyticsData?.spendingTrend?.slice(-14) || [];

  // Generate sparkline data if we don't have real data yet
  const sparklineData = spendingTrend.length > 0
    ? spendingTrend
    : [...Array(14)].map((_, i) => ({ date: `Day ${i}`, amount: Math.random() * 200 + 50 }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's what's happening with your finances today.</p>
        </div>
        <div className="flex items-center gap-3">
          {flaggedCount > 0 && (
            <Link href="/dashboard/fraud">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm cursor-pointer hover:bg-red-500/15 transition-colors"
              >
                <ShieldAlert size={14} className="animate-pulse" />
                {flaggedCount} Fraud Alert{flaggedCount > 1 ? 's' : ''}
              </motion.div>
            </Link>
          )}
          <Link href="/dashboard/transactions">
            <button className="flex items-center gap-2 bg-emerald-500 text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors">
              <Zap size={14} />
              Add Transaction
            </button>
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Total Balance" value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} change={2.4} changeLabel="vs last month" icon={DollarSign} iconColor="bg-emerald-500/15 text-emerald-400" trend="up" loading={txLoading} />
        <MetricCard title="Monthly Income" value={`$${income.toLocaleString()}`} change={0} changeLabel="" icon={TrendingUp} iconColor="bg-blue-500/15 text-blue-400" trend="neutral" />
        <MetricCard title="Total Spent" value={`$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} change={budgetUsed} changeLabel="of budget" icon={TrendingDown} iconColor="bg-red-500/15 text-red-400" trend={budgetUsed > 80 ? 'down' : 'up'} loading={txLoading} />
        <MetricCard title="Savings" value={`$${savings.toLocaleString()}`} change={12} changeLabel="this month" icon={PiggyBank} iconColor="bg-amber-500/15 text-amber-400" trend="up" />
        <MetricCard title="Health Score" value={`${insights?.healthScore || 75}/100`} change={3} changeLabel="improvement" icon={Brain} iconColor="bg-purple-500/15 text-purple-400" trend="up" loading={!insights} />
        <MetricCard title="Fraud Alerts" value={`${flaggedCount}`} change={flaggedCount} changeLabel="flagged" icon={Shield} iconColor={flaggedCount > 0 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'} trend={flaggedCount > 0 ? 'down' : 'up'} loading={txLoading} />
      </div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Trend Area Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Spending Trend</h2>
              <p className="text-xs text-gray-500">Last 14 days</p>
            </div>
            <Link href="/dashboard/analytics">
              <button className="text-xs text-emerald-400 hover:underline">View all →</button>
            </Link>
          </div>
          {analyticsLoading ? (
            <div className="skeleton h-[200px] rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Spent']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#spendGradient)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">By Category</h2>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="skeleton h-[160px] rounded-xl mb-4" />
          ) : categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {categoryData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} formatter={(v) => [`$${Number(v).toFixed(2)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {categoryData.slice(0, 4).map((cat: any, i: number) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400">{cat.name}</span>
                    </div>
                    <span className="text-white font-medium">${cat.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex flex-col items-center justify-center text-gray-500 text-sm">
              <PiggyBank size={32} className="mb-2 opacity-30" />
              <p>No data yet</p>
              <Link href="/dashboard/transactions">
                <p className="text-emerald-400 text-xs mt-1 hover:underline">Add transactions →</p>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Transactions</h2>
            <Link href="/dashboard/transactions">
              <button className="text-xs text-emerald-400 hover:underline">View all →</button>
            </Link>
          </div>

          {txLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-1">
              {transactions.slice(0, 8).map((t, i) => (
                <TransactionRow key={t._id} t={t} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <CreditCard size={40} className="mb-3 opacity-20" />
              <p className="text-sm">No transactions yet</p>
              <Link href="/dashboard/transactions">
                <p className="text-emerald-400 text-xs mt-2 hover:underline">Add your first transaction →</p>
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar: Budget + AI insight + Market */}
        <div className="space-y-4">
          {/* Budget Progress */}
          <div className="glass rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Budget Status</h2>
              <Link href="/dashboard/budgets">
                <button className="text-xs text-emerald-400 hover:underline">Manage →</button>
              </Link>
            </div>

            {budgets.length > 0 ? (
              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => (
                  <div key={b._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300">{b.category}</span>
                      <span className={b.isOverBudget ? 'text-red-400' : 'text-gray-400'}>
                        ${b.spent.toFixed(0)} / ${b.amount.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-1.5 rounded-full ${b.isOverBudget ? 'bg-red-500' : b.progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Target size={24} className="text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No budgets set</p>
                <Link href="/dashboard/budgets">
                  <p className="text-xs text-emerald-400 mt-1 hover:underline">Create budget →</p>
                </Link>
              </div>
            )}
          </div>

          {/* AI Quick Insight */}
          {insights?.insights?.[0] && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Brain size={15} className="text-purple-400" />
                <span className="text-xs text-purple-400 font-medium uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-sm text-white font-medium mb-1">{insights.insights[0].title}</p>
              <p className="text-xs text-gray-400 mb-3 leading-relaxed">{insights.insights[0].message}</p>
              <div className="text-xs text-emerald-400 font-medium">{insights.insights[0].impact}</div>
              <Link href="/dashboard/ai-insights">
                <p className="text-xs text-purple-400 mt-2 hover:underline">See all insights →</p>
              </Link>
            </motion.div>
          )}

          {/* Market Ticker */}
          {marketData.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-white/8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">Markets</h2>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                {marketData.slice(0, 4).map((m: any) => (
                  <div key={m.symbol} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-white font-medium">{m.symbol}</span>
                      <span className="text-gray-500 ml-2">{m.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white">${m.price.toFixed(m.symbol === 'BTC' ? 0 : 2)}</div>
                      <div className={m.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {m.changePercent >= 0 ? '+' : ''}{m.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
