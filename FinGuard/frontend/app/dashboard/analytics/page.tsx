'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

const PERIODS = [
  { label: '7D', value: '7' },
  { label: '30D', value: '30' },
  { label: '90D', value: '90' },
  { label: '1Y', value: '365' },
];

export default function AnalyticsPage() {
  const { user } = useStore();
  const [period, setPeriod] = useState('30');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const { data } = await api.get(`/analytics?period=${period}`);
      return data;
    },
    enabled: !!user,
  });

  const { data: cashFlow, isLoading: cfLoading } = useQuery({
    queryKey: ['cashflow'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/cashflow');
      return data;
    },
    enabled: !!user,
  });

  const spendingTrend = data?.spendingTrend || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const monthlyData = data?.monthlyData || [];
  const topMerchants = data?.topMerchants || [];
  const summary = data?.summary || {};

  const radarData = categoryBreakdown.slice(0, 6).map((c: any) => ({
    subject: c.name,
    value: c.value,
    fullMark: Math.max(...categoryBreakdown.map((x: any) => x.value)) || 1,
  }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={26} />
            Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-1">Deep insights into your spending patterns</p>
        </div>

        {/* Period selector */}
        <div className="flex p-1 glass rounded-xl border border-white/8">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${period === p.value
                ? 'bg-emerald-500 text-black'
                : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: `$${(summary.totalSpent || 0).toLocaleString()}`, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Daily Average', value: `$${(summary.avgDailySpend || 0).toFixed(2)}`, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Transactions', value: summary.transactionCount || 0, icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Top Category', value: summary.topCategory || 'N/A', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">{stat.label}</p>
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={15} className={stat.color} />
              </div>
            </div>
            {isLoading ? <div className="skeleton h-7 w-24 rounded-lg" /> : (
              <p className="text-xl font-bold text-white">{stat.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Spending trend */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h2 className="text-base font-semibold text-white mb-6">Spending Trend</h2>
        {isLoading ? <div className="skeleton h-64 rounded-xl" /> : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={spendingTrend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                formatter={(v) => [`${Number(v).toFixed(2)}`, "Spent"]} />
              <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#grad1)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-base font-semibold text-white mb-6">Income vs Expenses (6 months)</h2>
          {cfLoading ? <div className="skeleton h-52 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={cashFlow || []} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  formatter={(v, name) => [`$${Number(v).toFixed(2)}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category donut */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-base font-semibold text-white mb-4">Category Breakdown</h2>
          {isLoading ? <div className="skeleton h-52 rounded-xl" /> : categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={categoryBreakdown.slice(0, 8)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {categoryBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {categoryBreakdown.slice(0, 7).map((cat: any, i: number) => {
                  const total = categoryBreakdown.reduce((s: number, c: any) => s + c.value, 0);
                  const pct = total > 0 ? (cat.value / total * 100).toFixed(0) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-300">{cat.name}</span>
                        </div>
                        <span className="text-gray-400">{pct}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-1 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500 text-sm">No data for selected period</div>
          )}
        </div>
      </div>

      {/* Bottom row: monthly trend + top merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Month-over-month */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-base font-semibold text-white mb-6">Monthly Spending Comparison</h2>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top merchants */}
        <div className="glass rounded-2xl p-6 border border-white/8">
          <h2 className="text-base font-semibold text-white mb-4">Top Merchants</h2>
          {isLoading ? <div className="skeleton h-52 rounded-xl" /> : topMerchants.length > 0 ? (
            <div className="space-y-3">
              {topMerchants.slice(0, 7).map((m: any, i: number) => {
                const maxAmount = topMerchants[0]?.amount || 1;
                const pct = (m.amount / maxAmount * 100).toFixed(0);
                return (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden shrink-0">
                      {m.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.logo} alt={m.name} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{m.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{m.name}</span>
                        <span className="text-white font-medium">${m.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{m.count}×</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-500 text-sm">No merchant data available</div>
          )}
        </div>
      </div>
    </div>
  );
}

