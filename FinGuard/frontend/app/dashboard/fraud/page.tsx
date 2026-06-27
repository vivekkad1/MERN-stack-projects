'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line
} from 'recharts';
import {
  ShieldAlert, Shield, AlertTriangle, Zap, Clock, TrendingUp,
  Copy, Eye, Moon, Target, MapPin, DollarSign, Activity, RefreshCw,
  CheckCircle, XCircle
} from 'lucide-react';

function RiskGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s < 25) return '#10b981';
    if (s < 50) return '#f59e0b';
    if (s < 75) return '#f97316';
    return '#ef4444';
  };

  const getLabel = (s: number) => {
    if (s < 25) return { text: 'Low Risk', color: 'text-emerald-400' };
    if (s < 50) return { text: 'Moderate Risk', color: 'text-amber-400' };
    if (s < 75) return { text: 'High Risk', color: 'text-orange-400' };
    return { text: 'Critical Risk', color: 'text-red-400' };
  };

  const color = getColor(score);
  const label = getLabel(score);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-white"
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>
      <p className={`text-sm font-semibold mt-2 ${label.color}`}>{label.text}</p>
    </div>
  );
}

const FRAUD_PATTERNS = [
  { key: 'duplicateCharges', label: 'Duplicate Charges', icon: Copy, description: 'Same vendor + amount within 60s', color: 'text-red-400' },
  { key: 'velocityAttacks', label: 'Velocity Attacks', icon: Zap, description: '5+ transactions per minute', color: 'text-orange-400' },
  { key: 'nightTimeSpending', label: 'Night-time Spending', icon: Moon, description: 'Transactions at 11PM–5AM', color: 'text-purple-400' },
  { key: 'abnormalAmount', label: 'Abnormal Amounts', icon: TrendingUp, description: '3x average transaction value', color: 'text-amber-400' },
  { key: 'merchantFrequency', label: 'Merchant Frequency Spike', icon: Target, description: '3+ charges same merchant/day', color: 'text-blue-400' },
  { key: 'highValue', label: 'High-Value Transactions', icon: DollarSign, description: 'Transactions over $500', color: 'text-cyan-400' },
  { key: 'unusualCategory', label: 'Unusual Categories', icon: AlertTriangle, description: 'High-risk merchant categories', color: 'text-pink-400' },
];

function LiveSandbox({ onSimulate }: { onSimulate: () => void }) {
  const [vendor, setVendor] = useState('Amazon');
  const [amount, setAmount] = useState('89.99');
  const [category, setCategory] = useState('Shopping');
  const [isInjecting, setIsInjecting] = useState(false);
  const { addTransaction, addAlert } = useStore();
  const qc = useQueryClient();

  const inject = async (count = 1) => {
    setIsInjecting(true);
    try {
      for (let i = 0; i < count; i++) {
        const { data } = await api.post('/transactions', { vendor, amount: Number(amount), category });
        addTransaction(data.transaction);
        if (data.triggerAlert) addAlert(data.transaction);
        if (i < count - 1) await new Promise(r => setTimeout(r, 300));
      }
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['fraud'] });
      onSimulate();
    } catch { /* noop */ }
    setIsInjecting(false);
  };

  return (
    <div className="glass rounded-2xl p-6 border border-cyan-500/15 bg-cyan-500/3">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-cyan-400" />
        <h3 className="text-base font-semibold text-white">Live Sandbox</h3>
        <span className="ml-auto text-xs text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">SIMULATION</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vendor</label>
          <input value={vendor} onChange={e => setVendor(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Amount</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50">
            {['Shopping', 'Food', 'SaaS', 'Entertainment', 'Travel', 'Investment'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => inject(1)} disabled={isInjecting} className="py-2.5 rounded-xl bg-white/8 text-white text-sm font-medium hover:bg-white/12 transition-colors disabled:opacity-50">
          Inject Single
        </button>
        <button onClick={() => inject(2)} disabled={isInjecting} className="py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors disabled:opacity-50">
          Rapid-Fire (×2)
        </button>
        <button onClick={() => inject(5)} disabled={isInjecting} className="py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
          Velocity Attack (×5)
        </button>
      </div>
    </div>
  );
}

export default function FraudPage() {
  const { user, alerts } = useStore();
  const [refreshKey, setRefreshKey] = useState(0);
  const qc = useQueryClient();

  const { data: fraudData, isLoading } = useQuery({
    queryKey: ['fraud', refreshKey],
    queryFn: async () => {
      const { data } = await api.get('/fraud/overview');
      return data;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const { data: timeline } = useQuery({
    queryKey: ['fraud-timeline', refreshKey],
    queryFn: async () => {
      const { data } = await api.get('/fraud/timeline');
      return data;
    },
    enabled: !!user,
  });

  const refresh = () => {
    setRefreshKey(k => k + 1);
    qc.invalidateQueries({ queryKey: ['fraud'] });
  };

  const avgRisk = fraudData?.stats?.avgRiskScore || 0;
  const patterns = fraudData?.patterns || {};
  const radarData = FRAUD_PATTERNS.map(p => ({
    subject: p.label.split(' ')[0],
    count: patterns[p.key] || 0,
    fullMark: 10,
  }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-red-400" size={26} />
            Fraud Intelligence Center
          </h1>
          <p className="text-sm text-gray-400 mt-1">Real-time transaction monitoring and behavioral analysis</p>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white glass border border-white/8 px-4 py-2 rounded-xl transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: fraudData?.stats?.total || 0, color: 'text-white' },
          { label: 'Flagged', value: fraudData?.stats?.flagged || 0, color: 'text-red-400' },
          { label: 'Flag Rate', value: `${fraudData?.stats?.flaggedPercent || 0}%`, color: 'text-amber-400' },
          { label: 'Fraud Amount', value: `$${(fraudData?.stats?.totalFraudAmount || 0).toFixed(2)}`, color: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5 border border-white/8">
            <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{isLoading ? '—' : stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Risk Gauge + Patterns */}
        <div className="space-y-6">
          {/* Risk Score */}
          <div className="glass rounded-2xl p-6 border border-white/8 flex flex-col items-center">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 self-start">Account Risk Score</h2>
            {isLoading ? (
              <div className="skeleton w-36 h-36 rounded-full" />
            ) : (
              <RiskGauge score={avgRisk} />
            )}
            <p className="text-xs text-gray-500 text-center mt-4">
              Based on behavioral analysis of your last 30 days of transactions
            </p>
          </div>

          {/* Radar Chart */}
          <div className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-sm font-semibold text-white mb-4">Fraud Pattern Radar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Radar name="Detections" dataKey="count" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Center: Timeline + Patterns */}
        <div className="space-y-6">
          {/* Risk Timeline */}
          <div className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-sm font-semibold text-white mb-4">Risk Score Timeline (30 days)</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={timeline || []}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2} fill="url(#riskGrad)" dot={false} />
                <Area type="monotone" dataKey="flagged" stroke="#f59e0b" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Detected Patterns */}
          <div className="glass rounded-2xl p-6 border border-white/8">
            <h2 className="text-sm font-semibold text-white mb-4">Detection Breakdown</h2>
            <div className="space-y-3">
              {FRAUD_PATTERNS.map((pattern) => {
                const count = patterns[pattern.key] || 0;
                return (
                  <div key={pattern.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <pattern.icon size={15} className={pattern.color} />
                      <div>
                        <p className="text-xs font-medium text-white">{pattern.label}</p>
                        <p className="text-xs text-gray-500">{pattern.description}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${count > 0
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {count > 0 ? <XCircle size={10} /> : <CheckCircle size={10} />}
                      {count > 0 ? `${count} detected` : 'Clear'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live alerts + Sandbox */}
        <div className="space-y-6">
          {/* Live Sandbox */}
          <LiveSandbox onSimulate={() => setRefreshKey(k => k + 1)} />

          {/* Alert Feed */}
          <div className="glass rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Live Alert Feed</h2>
              {alerts.length > 0 && (
                <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  {alerts.length} Active
                </span>
              )}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {alerts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center py-8 text-gray-500"
                  >
                    <Shield size={32} className="mb-2 opacity-30" />
                    <p className="text-sm">Monitoring active</p>
                    <p className="text-xs text-gray-600">No alerts detected</p>
                  </motion.div>
                ) : (
                  alerts.slice(0, 8).map((alert, i) => (
                    <motion.div
                      key={`${alert._id}-${i}`}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-red-950/40 border border-red-500/25 rounded-xl p-3.5 relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
                      <div className="flex items-start gap-3 pl-2">
                        <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-400">
                            {alert.fraudReasons?.[0]?.split('—')[0] || 'Fraud Pattern Detected'}
                          </p>
                          <p className="text-xs text-gray-300 mt-0.5">
                            <span className="font-medium text-white">{alert.vendor}</span> — ${alert.amount}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Risk: <span className="text-orange-400 font-medium">{alert.riskScore}/100</span> ·{' '}
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Recent flagged */}
          {fraudData?.flaggedTransactions?.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-white/8">
              <h2 className="text-sm font-semibold text-white mb-3">Flagged Transactions</h2>
              <div className="space-y-2">
                {fraudData.flaggedTransactions.slice(0, 5).map((t: any) => (
                  <div key={t._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-xs font-medium text-white">{t.vendor}</p>
                      <p className="text-xs text-gray-500">{t.fraudReasons?.[0]?.substring(0, 40)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white">${t.amount.toFixed(2)}</p>
                      <p className="text-xs text-red-400">{t.riskScore}/100</p>
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
