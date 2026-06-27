import { create } from 'zustand';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  currency?: string;
  monthlyIncome?: number;
  savingsGoal?: number;
  theme?: string;
}

export interface Transaction {
  _id: string;
  vendor: string;
  amount: number;
  category: string;
  timestamp: string;
  status: 'Cleared' | 'Flagged' | 'Pending';
  riskScore: number;
  fraudReasons: string[];
  tags: string[];
  notes: string;
  merchantLogo: string;
  isRecurring: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  type: 'debit' | 'credit';
  currency: string;
  paymentMethod: string;
  location: string;
}

export interface Budget {
  _id: string;
  category: string;
  amount: number;
  spent: number;
  progress: number;
  remaining: number;
  isOverBudget: boolean;
  isAlertThresholdReached: boolean;
  period: string;
  color: string;
  icon: string;
  alertThreshold: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export interface FraudAlert extends Transaction {
  fraudReasons: string[];
  riskScore: number;
}

interface StoreState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Transactions
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;

  // Fraud
  alerts: FraudAlert[];
  addAlert: (alert: FraudAlert) => void;
  clearAlerts: () => void;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: number;

  // Budgets
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;

  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),

  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t._id === id ? { ...t, ...updates } : t
      ),
    })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t._id !== id),
    })),

  // Fraud
  alerts: [],
  addAlert: (alert) =>
    set((state) => ({ alerts: [alert, ...state.alerts] })),
  clearAlerts: () => set({ alerts: [] }),

  // Notifications
  notifications: [],
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  unreadCount: 0,

  // Budgets
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),

  // UI State
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  notificationPanelOpen: false,
  setNotificationPanelOpen: (open) => set({ notificationPanelOpen: open }),
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
