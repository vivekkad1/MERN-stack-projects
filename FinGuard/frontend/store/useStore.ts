import { create } from 'zustand';

interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Transaction {
  _id: string;
  vendor: string;
  amount: number;
  category: string;
  timestamp: string;
  status: 'Cleared' | 'Flagged';
}

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  alerts: Transaction[];
  addAlert: (alert: Transaction) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [transaction, ...state.transactions] 
  })),
  alerts: [],
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts]
  }))
}));
