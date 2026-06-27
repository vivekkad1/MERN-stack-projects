'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Search, Filter, Download, Trash2, Plus, CreditCard, ShieldAlert,
  CheckCircle, Clock, ChevronUp, ChevronDown, RefreshCw, Zap, Star,
  Tag, SortAsc, X, Edit3, MoreHorizontal
} from 'lucide-react';
import { Transaction } from '@/store/useStore';

const CATEGORIES = ['All', 'Housing', 'Food', 'Entertainment', 'Utilities', 'SaaS', 'Transportation', 'Healthcare', 'Shopping', 'Travel', 'Education', 'Investment', 'Misc'];
const STATUS_OPTIONS = ['All', 'Cleared', 'Flagged', 'Pending'];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Cleared: 'badge-success',
    Flagged: 'badge-danger',
    Pending: 'badge-warning',
  }[status] || 'badge-info';

  const icons = {
    Cleared: <CheckCircle size={10} />,
    Flagged: <ShieldAlert size={10} />,
    Pending: <Clock size={10} />,
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {icons} {status}
    </span>
  );
}

function AddTransactionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    vendor: '', amount: '', category: 'Food', notes: '', tags: '',
    paymentMethod: 'card', type: 'debit', currency: 'USD',
  });
  const [loading, setLoading] = useState(false);
  const { addTransaction, addAlert } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/transactions', {
        ...form,
        amount: Number(form.amount),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      });
      addTransaction(data.transaction);
      if (data.triggerAlert) addAlert(data.transaction);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add transaction', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg glass-strong rounded-2xl border border-white/12 shadow-2xl"
      >
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Add Transaction</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Merchant / Vendor</label>
              <input
                required
                placeholder="e.g. Amazon"
                value={form.vendor}
                onChange={e => setForm({ ...form, vendor: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Amount (USD)</label>
              <input
                required type="number" min="0.01" step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="debit">Debit (Expense)</option>
                <option value="credit">Credit (Income)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Notes (optional)</label>
            <input
              placeholder="Add a note..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Tags (comma-separated)</label>
            <input
              placeholder="e.g. work, travel, personal"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-60">
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function TransactionsPage() {
  const { user, transactions, setTransactions, addTransaction, addAlert, removeTransaction } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const queryClient = useQueryClient();

  const { isLoading, data: txData } = useQuery({
    queryKey: ['transactions', page, search, category, status, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page), limit: '15', sortBy, sortOrder,
        ...(search && { search }),
        ...(category !== 'All' && { category }),
        ...(status !== 'All' && { status }),
      });
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.transactions || []);
      return data;
    },
    enabled: !!user,
  });

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await api.post('/transactions/simulate');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) { console.error(err); }
    setSimulating(false);
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    try {
      await api.post('/transactions/bulk-delete', { ids: selected });
      selected.forEach(id => removeTransaction(id));
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) { console.error(err); }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.patch(`/transactions/${id}/favorite`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (err) { console.error(err); }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <SortAsc size={12} className="text-gray-600" />;
    return sortOrder === 'asc' ? <ChevronUp size={12} className="text-emerald-400" /> : <ChevronDown size={12} className="text-emerald-400" />;
  };

  const pagination = txData?.pagination;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-gray-400 mt-1">{pagination?.total || 0} total transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/25 text-purple-400 text-sm px-4 py-2 rounded-xl hover:bg-purple-500/15 transition-colors disabled:opacity-50"
          >
            <Zap size={14} className={simulating ? 'animate-pulse' : ''} />
            {simulating ? 'Simulating...' : 'Simulate Data'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-emerald-500 text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-400 transition-colors"
          >
            <Plus size={14} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-white/8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Search vendor, tags, notes..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {selected.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 text-sm px-3 py-2.5 rounded-xl hover:bg-red-500/15 transition-colors"
            >
              <Trash2 size={14} /> Delete {selected.length}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/8 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[40px_1fr_120px_100px_120px_80px_80px] gap-4 px-5 py-3 border-b border-white/8 text-xs text-gray-500 uppercase tracking-wider">
          <div>
            <input
              type="checkbox"
              checked={selected.length === transactions.length && transactions.length > 0}
              onChange={e => setSelected(e.target.checked ? transactions.map(t => t._id) : [])}
              className="rounded"
            />
          </div>
          <button className="flex items-center gap-1 text-left hover:text-gray-300 transition-colors" onClick={() => handleSort('vendor')}>
            Merchant <SortIcon field="vendor" />
          </button>
          <button className="flex items-center gap-1 hover:text-gray-300 transition-colors" onClick={() => handleSort('category')}>
            Category <SortIcon field="category" />
          </button>
          <button className="flex items-center gap-1 hover:text-gray-300 transition-colors" onClick={() => handleSort('amount')}>
            Amount <SortIcon field="amount" />
          </button>
          <button className="flex items-center gap-1 hover:text-gray-300 transition-colors" onClick={() => handleSort('timestamp')}>
            Date <SortIcon field="timestamp" />
          </button>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="divide-y divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-5 py-4">
                <div className="skeleton h-8 rounded-lg" />
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-white/4">
            <AnimatePresence>
              {transactions.map((t, index) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.02 }}
                  className={`grid grid-cols-[40px_1fr_120px_100px_120px_80px_80px] gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors items-center ${t.status === 'Flagged' ? 'bg-red-500/3' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(t._id)}
                    onChange={() => toggleSelect(t._id)}
                    className="rounded"
                  />

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/8 shrink-0">
                      {t.merchantLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.merchantLogo} alt={t.vendor} className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <CreditCard size={14} className="text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{t.vendor}</p>
                        {t.isRecurring && <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">↻</span>}
                        {t.isFavorite && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      {t.notes && <p className="text-xs text-gray-500 truncate">{t.notes}</p>}
                      {t.tags?.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {t.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-xs bg-white/5 text-gray-400 px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg w-fit">{t.category}</span>

                  <span className={`text-sm font-semibold ${t.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                    {t.type === 'credit' ? '+' : '-'}${t.amount.toFixed(2)}
                  </span>

                  <span className="text-xs text-gray-400">
                    {new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <br />
                    {new Date(t.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  <StatusBadge status={t.status} />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(t._id)}
                      className={`p-1.5 rounded-lg hover:bg-white/8 transition-colors ${t.isFavorite ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}
                    >
                      <Star size={13} className={t.isFavorite ? 'fill-amber-400' : ''} />
                    </button>
                    {t.riskScore > 30 && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-red-400">{t.riskScore}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <CreditCard size={48} className="mb-4 opacity-20" />
            <p className="text-base font-medium">No transactions found</p>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your filters or add new transactions</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/8">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p
                      ? 'bg-emerald-500 text-black'
                      : 'text-gray-400 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddTransactionModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['transactions'] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
