'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';
import { Activity, Eye, EyeOff, ArrowRight, Lock, Mail, User, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password });
        setUser(data);
      } else {
        const { data } = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
        setUser(data);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-500/10 blur-[60px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Activity size={20} className="text-black" />
            </div>
            <span className="text-xl font-bold text-white">FinGuard AI</span>
          </div>

          {/* Main content */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Take control of your financial future
            </h1>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Intelligent fraud detection, AI-powered insights, and beautiful analytics — all in one platform.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                'AI-powered fraud detection with 8+ patterns',
                'Real-time spending analytics & charts',
                'Smart budget planning & forecasting',
                'Subscription waste detection & management',
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6">
            {[
              { label: '12K+', sub: 'Users' },
              { label: '98%', sub: 'Detection Rate' },
              { label: '$2.4M+', sub: 'Analyzed' },
            ].map((badge) => (
              <div key={badge.label} className="text-center">
                <div className="text-xl font-bold text-emerald-400">{badge.label}</div>
                <div className="text-xs text-gray-500">{badge.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Activity size={20} className="text-black" />
            </div>
            <span className="text-xl font-bold text-white">FinGuard AI</span>
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 glass rounded-2xl mb-8 border border-white/5">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${mode === m
                  ? 'bg-emerald-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {mode === 'login'
                  ? 'Enter your credentials to access your dashboard.'
                  : 'Start your financial journey with FinGuard AI.'}
              </p>

              <div className="mb-6 flex justify-center w-full">
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        setLoading(true);
                        const { data } = await api.post('/auth/google', {
                          credential: credentialResponse.credential,
                        });
                        setUser(data);
                        router.push('/dashboard');
                      } catch (err: any) {
                        setError(err.response?.data?.message || 'Google authentication failed');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={() => {
                      setError('Google login failed');
                    }}
                    useOneTap
                    theme="filled_black"
                    shape="rectangular"
                    width="100%"
                  />
                ) : (
                  <button
                    disabled
                    className="w-full bg-white/5 border border-white/10 text-gray-500 py-2.5 rounded-sm flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                    title="Please configure NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables to enable Google Login."
                  >
                    <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google (Setup Required)</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 uppercase font-medium">Or continue with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs text-emerald-400 hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-black font-semibold py-3.5 rounded-xl text-sm hover:bg-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  className="text-emerald-400 font-medium hover:underline"
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
