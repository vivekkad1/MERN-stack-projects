'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';
import {
  User, Mail, DollarSign, Globe, Clock, Shield, Bell,
  Download, Trash2, CheckCircle, Edit3, Save, X
} from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CNY', 'BRL', 'CHF'];
const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'];

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    currency: user?.currency || 'USD',
    monthlyIncome: user?.monthlyIncome || 5000,
    savingsGoal: user?.savingsGoal || 1000,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Profile update endpoint (to be added to backend)
      // For now update local state
      setUser({ ...user!, ...form });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* noop */ } finally { setSaving(false); }
  };

  const stats = [
    { label: 'Member Since', value: '2025', icon: Clock },
    { label: 'Email Verified', value: 'Yes', icon: CheckCircle },
    { label: 'Account Status', value: 'Active', icon: Shield },
    { label: 'Currency', value: form.currency, icon: DollarSign },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <User className="text-gray-400" size={26} />Profile & Settings
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account preferences and security</p>
        </div>
        {saved && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-xl">
            <CheckCircle size={14} /> Changes saved!
          </motion.div>
        )}
      </div>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-8 border border-white/8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pro Account
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors ${editing
              ? 'bg-white/8 text-gray-300 hover:bg-white/12'
              : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
            }`}
          >
            {editing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Profile</>}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/4 rounded-xl p-3.5 border border-white/6">
              <div className="flex items-center gap-2 mb-1.5">
                <s.icon size={13} className="text-gray-500" />
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
              <p className="text-sm font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={!editing}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Email Address</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm opacity-50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Preferred Currency</label>
            <select
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              disabled={!editing}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Monthly Income ($)</label>
            <input
              type="number"
              value={form.monthlyIncome}
              onChange={e => setForm({ ...form, monthlyIncome: Number(e.target.value) })}
              disabled={!editing}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">Monthly Savings Goal ($)</label>
            <input
              type="number"
              value={form.savingsGoal}
              onChange={e => setForm({ ...form, savingsGoal: Number(e.target.value) })}
              disabled={!editing}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {editing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-60"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}
      </div>

      {/* Security Section */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Shield size={18} className="text-blue-400" /> Security
        </h2>
        <div className="space-y-4">
          {[
            { label: 'Change Password', desc: 'Update your password for better security', action: 'Update', color: 'text-white' },
            { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', action: 'Enable', color: 'text-emerald-400' },
            { label: 'Active Sessions', desc: 'Manage devices with access to your account', action: 'View', color: 'text-white' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-white/6 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button className={`text-sm font-medium ${item.color} glass border border-white/10 px-4 py-2 rounded-xl hover:bg-white/8 transition-colors`}>
                {item.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass rounded-2xl p-6 border border-white/8">
        <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <Bell size={18} className="text-amber-400" /> Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { label: 'Fraud Alerts', desc: 'Get notified of suspicious activity immediately', default: true },
            { label: 'Budget Warnings', desc: 'Alert when you reach 80% of any budget', default: true },
            { label: 'Monthly Reports', desc: 'Monthly summary of your financial activity', default: false },
            { label: 'Subscription Reminders', desc: 'Remind before subscription renewals', default: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${item.default ? 'bg-emerald-500' : 'bg-white/15'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${item.default ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass rounded-2xl p-6 border border-red-500/15 bg-red-500/3">
        <h2 className="text-base font-semibold text-red-400 mb-5 flex items-center gap-2">
          <Trash2 size={18} /> Danger Zone
        </h2>
        <div className="flex items-center justify-between py-4 border-b border-red-500/10">
          <div>
            <p className="text-sm font-medium text-white">Export All Data</p>
            <p className="text-xs text-gray-400">Download all your transactions and account data as CSV</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-white glass border border-white/10 px-4 py-2 rounded-xl hover:bg-white/8">
            <Download size={14} /> Export
          </button>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm font-medium text-red-400">Delete Account</p>
            <p className="text-xs text-gray-400">Permanently delete your account and all associated data</p>
          </div>
          <button className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
