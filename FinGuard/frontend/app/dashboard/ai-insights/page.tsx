'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Brain, TrendingUp, TrendingDown, Shield, CreditCard, CheckCircle,
  AlertTriangle, ChevronRight, Send, Sparkles, RefreshCw, Target
} from 'lucide-react';

const SEVERITY_CONFIG = {
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25', icon: CheckCircle },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/25', icon: Brain },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25', icon: AlertTriangle },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/25', icon: Shield },
};

const QUICK_QUESTIONS = [
  "How can I reduce my monthly spending?",
  "What subscriptions am I wasting money on?",
  "Are there any suspicious transactions?",
  "How much could I save next month?",
  "What's my financial health score breakdown?",
];

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function AIInsightsPage() {
  const { user } = useStore();
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "Hi! I'm your FinGuard AI assistant. I analyze your real transaction data to give you personalized financial insights. Ask me anything about your spending, savings, fraud alerts, or budget recommendations.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const { data } = await api.get('/ai/insights');
      return data;
    },
    enabled: !!user,
  });

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: message, timestamp: new Date() };
    setChat(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/chat', { message });
      const aiMsg: ChatMessage = { role: 'ai', content: data.response, timestamp: new Date() };
      setChat(prev => [...prev, aiMsg]);
    } catch {
      setChat(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const healthScore = insights?.healthScore || 0;
  const healthColor = healthScore >= 75 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444';
  const healthLabel = healthScore >= 75 ? 'Excellent' : healthScore >= 50 ? 'Good' : 'Needs Attention';

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="text-purple-400" size={26} />AI Financial Coach
          </h1>
          <p className="text-sm text-gray-400 mt-1">Personalized insights powered by your real transaction data</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white glass border border-white/8 px-4 py-2 rounded-xl transition-colors">
          <RefreshCw size={14} /> Refresh Insights
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Health Score + Insights */}
        <div className="space-y-5">
          {/* Health Score */}
          <div className="glass rounded-2xl p-6 border border-purple-500/20 bg-purple-500/4">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Financial Health Score</h2>
            <div className="flex items-center gap-5">
              {/* Circular gauge */}
              <div className="relative w-24 h-24 shrink-0">
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={healthColor}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - healthScore / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 6px ${healthColor}60)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{isLoading ? '—' : healthScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{healthLabel}</p>
                <p className="text-xs text-gray-400 mt-1">Based on 30-day analysis</p>
                <div className="mt-3 space-y-1.5 text-xs">
                  {[
                    { label: 'Savings Rate', ok: (insights?.summary?.savingsRate || 0) >= 20 },
                    { label: 'No Fraud Activity', ok: (insights?.summary?.totalSpent || 0) > 0 && (insights?.insights || []).filter((x: any) => x.type === 'fraud').length === 0 },
                    { label: 'Budget Adherence', ok: (insights?.summary?.savingsRate || 0) > 5 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.ok ? <CheckCircle size={11} className="text-emerald-400" /> : <AlertTriangle size={11} className="text-amber-400" />}
                      <span className={item.ok ? 'text-gray-300' : 'text-gray-400'}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          {insights?.summary && (
            <div className="glass rounded-2xl p-5 border border-white/8 space-y-3">
              <h2 className="text-sm font-semibold text-white">This Month</h2>
              {[
                { label: 'Total Spent', value: `$${insights.summary.totalSpent.toFixed(2)}`, color: 'text-white' },
                { label: 'Savings', value: `$${insights.summary.savings.toFixed(2)}`, color: 'text-emerald-400' },
                { label: 'Savings Rate', value: `${insights.summary.savingsRate.toFixed(1)}%`, color: insights.summary.savingsRate >= 20 ? 'text-emerald-400' : 'text-amber-400' },
                { label: 'Transactions', value: insights.summary.transactionCount, color: 'text-white' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0 text-sm">
                  <span className="text-gray-400">{item.label}</span>
                  <span className={`font-medium ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Prediction */}
          {insights?.predictions && (
            <div className="glass rounded-2xl p-5 border border-blue-500/20 bg-blue-500/4">
              <div className="flex items-center gap-2 mb-3">
                <Target size={15} className="text-blue-400" />
                <h2 className="text-sm font-semibold text-white">Next Month Prediction</h2>
              </div>
              <p className="text-2xl font-bold text-white mb-1">${insights.predictions.nextMonthExpenses.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Predicted expenses based on your patterns</p>
              {insights.predictions.savingsGoalProgress > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Savings goal progress</span>
                    <span className="text-emerald-400">{insights.predictions.savingsGoalProgress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${insights.predictions.savingsGoalProgress}%` }}
                      transition={{ duration: 1 }} className="h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: AI Insights */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white">Personalized Insights</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : insights?.insights?.length > 0 ? (
            <div className="space-y-3">
              {insights.insights.map((insight: any, i: number) => {
                const cfg = SEVERITY_CONFIG[insight.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-4 border ${cfg.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <cfg.icon size={16} className={`${cfg.color} shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${cfg.color} mb-1`}>{insight.title}</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-2">{insight.message}</p>
                        <p className="text-xs text-gray-400 italic mb-2">{insight.action}</p>
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                          <TrendingUp size={11} />
                          {insight.impact}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-2xl p-10 border border-white/8 flex flex-col items-center text-center">
              <Sparkles size={40} className="text-purple-400 mb-3 opacity-50" />
              <p className="text-white font-medium mb-1">No insights yet</p>
              <p className="text-gray-400 text-sm">Add some transactions first and I'll analyze your spending patterns.</p>
            </div>
          )}
        </div>

        {/* Right: AI Chat */}
        <div className="flex flex-col glass rounded-2xl border border-white/8 overflow-hidden h-[600px]">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/8">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Brain size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">FinGuard AI</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <AnimatePresence>
              {chat.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-emerald-500 text-black font-medium rounded-br-sm'
                    : 'bg-white/6 border border-white/8 text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/6 border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick questions */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_QUESTIONS.slice(0, 3).map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="shrink-0 text-xs text-gray-400 bg-white/5 border border-white/8 px-3 py-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors">
                  {q.substring(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/8">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              />
              <button type="submit" disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white hover:bg-purple-400 transition-colors disabled:opacity-50">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
