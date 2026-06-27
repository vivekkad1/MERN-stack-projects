'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PiggyBank, Plus, Trash2, TrendingUp, AlertTriangle, CheckCircle, Target, X } from 'lucide-react';

const CATEGORY_OPTIONS = ['Housing', 'Food', 'Entertainment', 'Utilities', 'SaaS', 'Transportation', 'Healthcare', 'Shopping', 'Travel', 'Education', 'Investment', 'Misc'];
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
const ICONS = ['🏠', '🍔', '🎬', '💡', '💻', '🚗', '🏥', '🛍️', '✈️', '📚', '📈', '📦'];

function BudgetModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ category: 'Food', amount: '', alertThreshold: '80', color: '#10b981', icon: '🍔' });
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/budgets', { ...form, amount: Number(form.amount), alertThreshold: Number(form.alertThreshold) });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      onSuccess();
      onClose();
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleCategoryChange = (cat: string) => {
    const idx = CATEGORY_OPTIONS.indexOf(cat);
    setForm({ ...form, category: cat, icon: ICONS[idx] || '💰', color: COLORS[idx % COLORS.length] });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md glass-strong rounded-2xl border border-white/12 shadow-2xl">
        <div className="p-6 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Create Budget</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Category</label>
            <select value={form.category} onChange={e => handleCategoryChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50">
              {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Monthly Budget Amount ($)</label>
            <input required type="number" min="1" placeholder="500.00" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Alert at {form.alertThreshold}% usage</label>
            <input type="range" min="50" max="100" step="5" value={form.alertThreshold}
              onChange={e => setForm({ ...form, alertThreshold: e.target.value })}
              className="w-full accent-emerald-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-60">
              {loading ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function BudgetsPage() {
  const { user, budgets, setBudgets } = useStore();
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await api.get('/budgets');
      setBudgets(data);
      return data;
    },
    enabled: !!user,
  });

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/budgets/${id}`);
      qc.invalidateQueries({ queryKey: ['budgets'] });
    } catch { /* noop */ }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.isOverBudget);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <PiggyBank className="text-amber-400" size={26} />Budget Planner
          </h1>
          <p className="text-sm text-gray-400 mt-1">Track and manage your monthly spending limits</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-500 text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors">
          <Plus size={14} /> New Budget
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}`, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Total Spent', value: `$${totalSpent.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, color: 'text-amber-400', bg: 'bg-amber-500/8' },
          { label: 'Over Budget', value: overBudget.length, color: overBudget.length > 0 ? 'text-red-400' : 'text-emerald-400', bg: overBudget.length > 0 ? 'bg-red-500/8' : 'bg-emerald-500/8' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-5 border border-white/8 ${s.bg}`}>
            <p className="text-xs text-gray-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{isLoading ? '—' : s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {budgets.map((budget, index) => (
              <motion.div
                key={budget._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className={`glass rounded-2xl p-6 border card-hover ${budget.isOverBudget
                  ? 'border-red-500/25 bg-red-500/4'
                  : budget.isAlertThresholdReached
                    ? 'border-amber-500/25 bg-amber-500/4'
                    : 'border-white/8'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${budget.color}20` }}>
                      {budget.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{budget.category}</h3>
                      <p className="text-xs text-gray-500 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {budget.isOverBudget && <AlertTriangle size={15} className="text-red-400" />}
                    {!budget.isOverBudget && budget.progress < 50 && <CheckCircle size={15} className="text-emerald-400" />}
                    <button onClick={() => handleDelete(budget._id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className={`font-semibold ${budget.isOverBudget ? 'text-red-400' : 'text-white'}`}>
                      ${budget.spent.toFixed(2)} spent
                    </span>
                    <span className="text-gray-400">of ${budget.amount.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-white/6 rounded-full h-2.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${budget.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-2.5 rounded-full relative ${budget.isOverBudget ? 'bg-red-500' : budget.progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ boxShadow: budget.isOverBudget ? '0 0 8px rgba(239,68,68,0.4)' : budget.progress > 80 ? '0 0 8px rgba(245,158,11,0.4)' : '0 0 8px rgba(16,185,129,0.4)' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className={budget.isOverBudget ? 'text-red-400 font-medium' : 'text-gray-500'}>
                      {budget.progress.toFixed(0)}% used
                    </span>
                    <span className={`font-medium ${budget.remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {budget.remaining > 0 ? `$${budget.remaining.toFixed(2)} left` : `$${Math.abs(budget.amount - budget.spent).toFixed(2)} over`}
                    </span>
                  </div>
                </div>

                {/* Alert threshold indicator */}
                {budget.isAlertThresholdReached && !budget.isOverBudget && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2">
                    <AlertTriangle size={12} />
                    Alert threshold reached ({budget.alertThreshold}%)
                  </div>
                )}
                {budget.isOverBudget && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2">
                    <AlertTriangle size={12} />
                    Over budget! Review spending
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass rounded-2xl p-16 border border-white/8 flex flex-col items-center text-center">
          <PiggyBank size={64} className="text-gray-600 mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-white mb-2">No budgets yet</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">Create your first budget to start tracking your spending limits and get alerts before you overspend.</p>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors">
            <Plus size={16} /> Create Your First Budget
          </button>
        </div>
      )}

      <AnimatePresence>
        {showModal && <BudgetModal onClose={() => setShowModal(false)} onSuccess={() => { }} />}
      </AnimatePresence>
    </div>
  );
}
