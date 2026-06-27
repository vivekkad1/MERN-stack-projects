'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, TrendingUp, Zap, BarChart3, Lock, Bell, ArrowRight, ChevronDown,
  Star, CheckCircle, Activity, CreditCard, PieChart, Brain, Globe, Smartphone,
  ShieldAlert, Eye, Database, Cpu, Play, X
} from 'lucide-react';

// ─── Animated Counter ───
function Counter({ target, prefix = '', suffix = '', duration = 2 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const step = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── Floating Finance Card ───
function FloatingCard({ delay = 0, x = 0, y = 0, children }: { delay?: number; x?: number; y?: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [y, y - 12, y],
        x: [x, x + 4, x],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        y: { delay, duration: 4, repeat: Infinity, ease: 'easeInOut' },
        x: { delay: delay + 0.5, duration: 5, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="absolute glass rounded-2xl p-4 shadow-2xl"
    >
      {children}
    </motion.div>
  );
}

// ─── Feature Card ───
function FeatureCard({ icon: Icon, title, description, color, delay }: {
  icon: React.ElementType; title: string; description: string; color: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 card-hover group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Pricing Card ───
function PricingCard({ plan, price, features, isPopular, delay }: {
  plan: string; price: string; features: string[]; isPopular?: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-2xl p-8 card-hover ${isPopular
        ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30'
        : 'glass'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}
      <div className="mb-6">
        <p className="text-gray-400 text-sm font-medium mb-1">{plan}</p>
        <div className="flex items-end gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          {price !== 'Free' && <span className="text-gray-400 mb-1">/month</span>}
        </div>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/auth">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${isPopular
            ? 'bg-emerald-500 text-black hover:bg-emerald-400'
            : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          Get Started
        </motion.button>
      </Link>
    </motion.div>
  );
}

const FEATURES = [
  { icon: Shield, title: 'Fraud Intelligence', description: '8+ fraud detection patterns including velocity attacks, duplicate charges, impossible travel, and night-time anomalies.', color: 'bg-red-500/10 text-red-400', delay: 0 },
  { icon: Brain, title: 'AI Financial Coach', description: 'Get personalized spending insights, savings recommendations, and financial health scores powered by AI analysis.', color: 'bg-purple-500/10 text-purple-400', delay: 0.1 },
  { icon: BarChart3, title: 'Advanced Analytics', description: 'Interactive charts, spending heatmaps, category breakdowns, and month-over-month comparisons.', color: 'bg-blue-500/10 text-blue-400', delay: 0.2 },
  { icon: TrendingUp, title: 'Budget Planner', description: 'Set smart budgets with AI-powered forecasting, overspending predictions, and savings goal tracking.', color: 'bg-emerald-500/10 text-emerald-400', delay: 0.3 },
  { icon: Zap, title: 'Real-time Alerts', description: 'Instant notifications for suspicious activity, budget overruns, bill due dates, and subscription renewals.', color: 'bg-amber-500/10 text-amber-400', delay: 0.4 },
  { icon: Globe, title: 'Multi-Currency', description: 'Track expenses across 30+ currencies with live exchange rates and automatic conversion.', color: 'bg-cyan-500/10 text-cyan-400', delay: 0.5 },
  { icon: Database, title: 'Transaction Management', description: 'Advanced table with search, filters, bulk operations, receipt scanning, tags, and merchant logos.', color: 'bg-indigo-500/10 text-indigo-400', delay: 0.6 },
  { icon: Smartphone, title: 'Subscription Tracker', description: 'Auto-detect and manage recurring subscriptions. See unused services and potential savings instantly.', color: 'bg-pink-500/10 text-pink-400', delay: 0.7 },
];

const TESTIMONIALS = [
  { name: 'Sanjay Mehta', role: 'Product Manager', avatar: 'SM', text: 'FinGuard caught a $300 duplicate charge before I even noticed. The fraud detection is genuinely impressive.', rating: 5 },
  { name: 'Emily Chen', role: 'Startup Founder', avatar: 'EC', text: "The AI insights helped me realize I was spending $180/month on subscriptions I barely use. Cancelled 3 of them instantly.", rating: 5 },
  { name: 'Marcus Williams', role: 'Software Engineer', avatar: 'MW', text: 'Best finance dashboard I\'ve used. The design is beautiful and the data is actually actionable, not just pretty charts.', rating: 5 },
];

const FAQS = [
  { q: 'How does the fraud detection work?', a: 'Our engine analyzes 8+ behavioral patterns including duplicate charges, velocity attacks (rapid transactions), night-time spending, merchant frequency spikes, and abnormal amounts compared to your spending history.' },
  { q: 'Is my financial data secure?', a: 'Yes. We use JWT with HttpOnly cookies, bcrypt password hashing, rate limiting, and Helmet.js security headers. Your data is stored encrypted in MongoDB Atlas with access controls.' },
  { q: 'Can I connect my real bank account?', a: 'Currently, you can manually add transactions or use our Live Sandbox to simulate realistic scenarios. Bank integration via Plaid is on our roadmap.' },
  { q: 'How does the AI assistant work?', a: 'The AI analyzes your actual transaction history to provide personalized insights—spending patterns, subscription waste, savings opportunities, and financial health scoring based on your real data.' },
];

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Mouse spotlight effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(16,185,129,0.04), transparent 80%)`,
        }}
      />

      {/* Animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_1s]" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-[100px] animate-[pulse_12s_ease-in-out_infinite_2s]" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 glass border-b border-white/5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Activity size={18} className="text-black" />
          </div>
          <span className="text-xl font-bold text-white">FinGuard AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Analytics', 'Security', 'Pricing'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-400 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth">
            <button className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2">
              Sign In
            </button>
          </Link>
          <Link href="/auth">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-emerald-500 text-black text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-400 transition-colors"
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <motion.div style={{ y: heroY }} className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/20 mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">AI-Powered Finance Intelligence</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6"
              >
                Your Money,{' '}
                <span className="text-gradient-green">
                  Intelligently
                </span>{' '}
                Protected
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-400 mb-8 max-w-xl leading-relaxed"
              >
                Enterprise-grade fraud detection, AI-powered insights, and beautiful analytics — built for people who take their finances seriously.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link href="/auth">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(16,185,129,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-emerald-500 text-black font-semibold px-8 py-4 rounded-2xl text-base hover:bg-emerald-400 transition-colors"
                  >
                    Start for Free <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 text-white glass border border-white/10 font-semibold px-8 py-4 rounded-2xl text-base hover:border-white/20 transition-colors"
                >
                  <Play size={16} className="fill-white" /> Watch Demo
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6"
              >
                <div className="flex -space-x-3">
                  {['SM', 'EC', 'MW', 'AK', 'JP'].map((initials) => (
                    <div key={initials} className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 border-2 border-background flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Trusted by 12,000+ users</p>
                </div>
              </motion.div>
            </div>

            {/* Right — floating cards */}
            <div className="relative h-[500px] hidden lg:block">
              {/* Main dashboard preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="absolute inset-0 glass rounded-3xl border border-white/10 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="h-5 bg-white/5 rounded-md flex-1 ml-2" />
                  </div>

                  {/* Mini metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Balance', value: '$24,520', color: 'text-emerald-400', change: '+2.4%' },
                      { label: 'Spent', value: '$3,840', color: 'text-red-400', change: '-5.2%' },
                      { label: 'Saved', value: '$1,200', color: 'text-blue-400', change: '+12%' },
                    ].map((item) => (
                      <div key={item.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                        <p className="text-gray-500 text-xs mb-1">{item.label}</p>
                        <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
                        <p className="text-xs text-gray-500">{item.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mini chart bars */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Spending this month</p>
                    <div className="flex items-end gap-1.5 h-20">
                      {[40, 65, 45, 80, 55, 70, 30, 85, 60, 75, 50, 90].map((h, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.05 }}
                          className="flex-1 rounded-sm"
                          style={{ background: `hsl(${155 + i * 5}, 60%, ${40 + (h / 10)}%)` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Mini transactions */}
                  <div className="space-y-2">
                    {[
                      { v: 'Netflix', a: '-$15.99', s: 'bg-emerald-500' },
                      { v: 'Amazon', a: '-$89.99', s: 'bg-amber-500' },
                      { v: 'Starbucks', a: '-$6.75', s: 'bg-red-500 animate-pulse' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-white/3 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${tx.s}`} />
                          <span className="text-gray-300">{tx.v}</span>
                        </div>
                        <span className="text-gray-400">{tx.a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating alert card */}
              <FloatingCard delay={0.8} x={-30} y={-20}>
                <div className="flex items-center gap-3 min-w-[220px]">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                    <ShieldAlert size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-400">Fraud Alert!</p>
                    <p className="text-xs text-gray-400">Duplicate charge detected</p>
                  </div>
                </div>
              </FloatingCard>

              {/* Floating score card */}
              <FloatingCard delay={1.0} x={240} y={60}>
                <div className="min-w-[150px]">
                  <p className="text-xs text-gray-400 mb-1">Health Score</p>
                  <p className="text-2xl font-bold text-emerald-400">87<span className="text-sm text-gray-500">/100</span></p>
                  <div className="flex gap-0.5 mt-1.5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < 7 ? 'bg-emerald-500' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              </FloatingCard>

              {/* Floating savings card */}
              <FloatingCard delay={1.2} x={260} y={340}>
                <div className="flex items-center gap-2 min-w-[160px]">
                  <TrendingUp size={20} className="text-emerald-400" />
                  <div>
                    <p className="text-xs text-gray-400">Monthly Savings</p>
                    <p className="text-sm font-bold text-white">+$1,240</p>
                  </div>
                </div>
              </FloatingCard>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={24} className="text-gray-600" />
        </motion.div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="py-24 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 12000, suffix: '+', label: 'Active Users', prefix: '' },
              { value: 2400000, suffix: '+', label: 'Transactions Analyzed', prefix: '$' },
              { value: 98, suffix: '%', label: 'Fraud Detection Accuracy', prefix: '' },
              { value: 1800, suffix: '+', label: 'Fraud Cases Caught', prefix: '' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  <Counter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-emerald-400 text-sm font-medium tracking-widest uppercase">Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
              Everything you need to master your finances
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From intelligent fraud detection to AI-powered coaching, FinGuard gives you an unfair advantage over your finances.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security Section ─── */}
      <section id="security" className="py-32 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-red-400 text-sm font-medium tracking-widest uppercase">Security First</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-6">
                Bank-grade security, <span className="text-gradient-green">always on</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Your financial data deserves the highest protection. We use enterprise-grade security at every layer.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'End-to-end Encryption', desc: 'All data encrypted at rest and in transit with AES-256' },
                  { icon: Eye, title: 'Behavioral Analysis', desc: 'AI monitors for unusual patterns 24/7 across all transactions' },
                  { icon: Bell, title: 'Instant Alerts', desc: 'Real-time notifications the moment suspicious activity is detected' },
                  { icon: Shield, title: 'Zero-Trust Architecture', desc: 'Every request is authenticated and validated before processing' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-3xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Fraud Intelligence Center</h3>
                  <span className="text-xs text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">LIVE</span>
                </div>

                {/* Risk Gauge */}
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-emerald-400 mb-1">23</div>
                  <div className="text-sm text-gray-400">Current Risk Score</div>
                  <div className="text-xs text-emerald-400 mt-1">● Low Risk</div>
                </div>

                {/* Detection items */}
                <div className="space-y-3">
                  {[
                    { label: 'Duplicate Charges', count: 0, status: 'safe' },
                    { label: 'Velocity Attacks', count: 0, status: 'safe' },
                    { label: 'Night-time Spending', count: 1, status: 'warn' },
                    { label: 'Abnormal Amounts', count: 0, status: 'safe' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-gray-300">{item.label}</span>
                      <div className={`flex items-center gap-2 text-xs px-2.5 py-1 rounded-full ${item.status === 'safe'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'safe' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                        {item.count === 0 ? 'Clear' : `${item.count} Alert`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute inset-0 rounded-3xl bg-red-500/5 blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Loved by finance-conscious people</h2>
            <p className="text-gray-400">Don't take our word for it — hear from our users.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 border border-white/8"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/30 to-blue-500/30 flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-32 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400">Start free. Upgrade when you need more power.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCard
              plan="Starter"
              price="Free"
              features={['100 transactions/month', 'Basic fraud detection', '3 budget categories', 'Email support']}
              delay={0}
            />
            <PricingCard
              plan="Pro"
              price="$12"
              features={['Unlimited transactions', 'Advanced AI fraud engine', 'Unlimited budgets', 'AI financial coach', 'Subscription tracker', 'Market data', 'Priority support']}
              isPopular
              delay={0.1}
            />
            <PricingCard
              plan="Enterprise"
              price="$49"
              features={['Everything in Pro', 'Multi-user accounts', 'Custom integrations', 'Advanced analytics', 'Custom AI models', 'Dedicated account manager', 'SLA guarantee']}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden border border-white/5"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={18} className="text-gray-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-6 pb-6 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative glass rounded-3xl p-16 border border-emerald-500/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Start protecting your finances today
              </h2>
              <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                Join 12,000+ users who use FinGuard to stay on top of their money.
              </p>
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-emerald-500 text-black font-bold px-10 py-4 rounded-2xl text-lg hover:bg-emerald-400 transition-colors"
                >
                  Get Started Free — No Credit Card
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Activity size={15} className="text-black" />
              </div>
              <span className="text-white font-bold">FinGuard AI</span>
            </div>
            <p className="text-gray-500 text-sm">© 2025 FinGuard AI. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Security'].map((link) => (
                <a key={link} href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
