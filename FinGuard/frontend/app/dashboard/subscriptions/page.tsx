'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  CreditCard, Plus, Trash2, RefreshCw, TrendingDown, DollarSign,
  Calendar, CheckCircle, AlertTriangle, Zap, X, ToggleLeft, ToggleRight
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { user } = useStore();
  const [detecting, setDetecting] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions');
      return data;
    },
    enabled: !!user,
  });

  const handleDetect = async () => {
    setDetecting(true);
    try {
      await api.get('/subscriptions/detect');
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
    } catch { /* noop */ } finally { setDetecting(false); }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/subscriptions/${id}`);
    qc.invalidateQueries({ queryKey: ['subscriptions'] });
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await api.put(`/subscriptions/${id}`, { isActive: !isActive });
    qc.invalidateQueries({ queryKey: ['subscriptions'] });
  };

  const subscriptions = data?.subscriptions || [];
  const summary = data?.summary || {};

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <CreditCard className="text-cyan-400" size={26} />Subscriptions
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage your recurring subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDetect} disabled={detecting}
            className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 text-purple-400 text-sm px-4 py-2 rounded-xl hover:bg-purple-500/15 transition-colors disabled:opacity-50">
            <Zap size={14} className={detecting ? 'animate-pulse' : ''} />
            {detecting ? 'Detecting...' : 'Auto-Detect'}
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-emerald-500 text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Cost', value: `$${(summary.totalMonthly || 0).toFixed(2)}`, icon: DollarSign, color: 'text-white' },
          { label: 'Annual Cost', value: `$${(summary.totalYearly || 0).toFixed(2)}`, icon: Calendar, color: 'text-amber-400' },
          { label: 'Active Subs', value: summary.activeCount || 0, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Potential Savings', value: `$${(summary.potentialSavings || 0).toFixed(2)}/mo`, icon: TrendingDown, color: 'text-green-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">{s.label}</p>
              <s.icon size={15} className={s.color} />
            </div>
            {isLoading ? <div className="skeleton h-7 w-24 rounded-lg" /> :
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>}
          </motion.div>
        ))}
      </div>

      {/* Subscriptions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {subscriptions.map((sub: any, index: number) => (
              <motion.div key={sub._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`glass rounded-2xl p-5 border card-hover ${!sub.isActive ? 'opacity-60 border-white/5' : 'border-white/8'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center overflow-hidden">
                      {sub.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sub.logo} alt={sub.name} className="w-7 h-7 object-contain" onError={e => (e.target as HTMLImageElement).style.display = 'none'} />
                      ) : (
                        <CreditCard size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{sub.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{sub.billingCycle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sub.isDetectedAutomatically && (
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">auto</span>
                    )}
                    <button onClick={() => handleToggle(sub._id, sub.isActive)} className="text-gray-500 hover:text-white transition-colors">
                      {sub.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => handleDelete(sub._id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-white">${sub.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">/{sub.billingCycle.replace('ly', '')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-400">
                      ${(sub.billingCycle === 'monthly' ? sub.amount * 12 : sub.billingCycle === 'yearly' ? sub.amount : sub.amount * 52).toFixed(2)}/yr
                    </p>
                    <p className={`text-xs font-medium ${sub.isActive ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {sub.isActive ? '● Active' : '○ Paused'}
                    </p>
                  </div>
                </div>

                {sub.nextBillingDate && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 pt-3 border-t border-white/5">
                    <Calendar size={11} />
                    Next billing: {new Date(sub.nextBillingDate).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 border border-white/8 flex flex-col items-center text-center">
          <CreditCard size={64} className="text-gray-600 mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-white mb-2">No subscriptions tracked</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">Click "Auto-Detect" to automatically find subscriptions from your transaction history, or add them manually.</p>
          <div className="flex gap-3">
            <button onClick={handleDetect} className="flex items-center gap-2 bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-400 transition-colors">
              <Zap size={16} /> Auto-Detect
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-white/8 text-white px-6 py-3 rounded-xl hover:bg-white/12 transition-colors">
              <Plus size={16} /> Add Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
