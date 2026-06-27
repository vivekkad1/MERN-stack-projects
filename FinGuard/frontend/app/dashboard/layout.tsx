'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import api from '@/lib/api';
import {
  Activity, LayoutDashboard, ArrowLeftRight, ShieldAlert, BarChart3,
  PiggyBank, CreditCard, Brain, User, Settings, LogOut, Bell, Search,
  ChevronLeft, ChevronRight, Menu, X, Command, ArrowRight
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', badge: null },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transactions', badge: null },
  { href: '/dashboard/fraud', icon: ShieldAlert, label: 'Fraud Center', badge: 'NEW' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', badge: null },
  { href: '/dashboard/budgets', icon: PiggyBank, label: 'Budgets', badge: null },
  { href: '/dashboard/subscriptions', icon: CreditCard, label: 'Subscriptions', badge: null },
  { href: '/dashboard/ai-insights', icon: Brain, label: 'AI Insights', badge: 'AI' },
  { href: '/dashboard/profile', icon: User, label: 'Profile', badge: null },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, sidebarCollapsed, toggleSidebar, commandPaletteOpen, setCommandPaletteOpen, notificationPanelOpen, setNotificationPanelOpen, unreadCount, alerts } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch {
        router.push('/auth');
      }
    };
    if (!user) checkAuth();
  }, [user, router, setUser]);

  const handleLogout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
    router.push('/auth');
  }, [setUser, router]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setNotificationPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen, setNotificationPanelOpen]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Activity size={20} className="text-emerald-400 animate-pulse" />
          </div>
          <div className="text-sm text-gray-500">Loading FinGuard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─── Sidebar ─── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="relative flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden z-20"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 h-16 border-b border-sidebar-border ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <Activity size={17} className="text-black" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-white text-base whitespace-nowrap overflow-hidden"
              >
                FinGuard AI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: sidebarCollapsed ? 0 : 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between flex-1 overflow-hidden"
                      >
                        <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                        {item.badge && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                            item.badge === 'AI' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={`p-3 border-t border-sidebar-border space-y-1 ${sidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full group relative ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>

          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-4 top-20 w-8 h-8 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-gray-400 hover:text-white transition-colors z-30 shadow-lg"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-gray-400 hover:bg-white/8 hover:text-gray-300 transition-all group w-64"
            >
              <Search size={14} />
              <span>Search transactions...</span>
              <div className="ml-auto flex items-center gap-1 text-xs bg-white/5 px-1.5 py-0.5 rounded-md">
                <Command size={10} />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Fraud alerts indicator */}
            {alerts.length > 0 && (
              <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                <ShieldAlert size={12} />
                {alerts.length} fraud alert{alerts.length > 1 ? 's' : ''}
              </div>
            )}

            {/* Notifications */}
            <button
              onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
              className="relative w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>

            {/* Avatar */}
            <Link href="/dashboard/profile">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/40 to-blue-500/40 flex items-center justify-center text-sm font-bold text-white hover:opacity-80 transition-opacity cursor-pointer border border-white/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto page-transition">
          {children}
        </main>
      </div>

      {/* ─── Command Palette ─── */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl glass-strong rounded-2xl border border-white/15 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
                <Search size={18} className="text-gray-400" />
                <input
                  autoFocus
                  placeholder="Search transactions, pages, actions..."
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                />
                <kbd className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded-lg">ESC</kbd>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 px-2 mb-2 uppercase tracking-wider">Navigate</p>
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setCommandPaletteOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
                      <item.icon size={16} className="text-gray-500" />
                      <span className="text-sm">{item.label}</span>
                      <ArrowRight size={12} className="ml-auto text-gray-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
