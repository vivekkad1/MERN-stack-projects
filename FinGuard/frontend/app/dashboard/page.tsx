'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import FraudCenter from '../../components/FraudCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity, DollarSign, Target, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function Dashboard() {
  const { user, setUser, transactions, setTransactions } = useStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch {
        router.push('/');
      }
    };
    if (!user) checkAuth();
  }, [user, router, setUser]);

  const { isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await api.get('/transactions');
      setTransactions(data);
      return data;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    router.push('/');
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalBalance = 15000 - ((transactions || []).reduce((acc, t) => acc + t.amount, 0));
  const monthlyIncome = 15000;
  const totalSpent = (transactions || []).reduce((acc, t) => acc + t.amount, 0);
  const budgetProgress = (totalSpent / monthlyIncome) * 100;

  let progressColor = 'bg-emerald-500';
  if (budgetProgress > 85) progressColor = 'bg-red-500';
  else if (budgetProgress > 50) progressColor = 'bg-amber-500';

  const categoryData = (transactions || []).reduce((acc: {name: string, value: number}[], t) => {
    const existing = acc.find(c => c.name === t.category);
    if (existing) existing.value += t.amount;
    else acc.push({ name: t.category, value: t.amount });
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3 text-emerald-400">
            <Activity size={32} />
            <h1 className="text-2xl font-bold">FinGuard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Welcome, {user.name}</span>
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" /> Logout
            </Button>
          </div>
        </header>

        {/* Metrics Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Balance</CardTitle>
              <DollarSign size={16} className="text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Monthly Income</CardTitle>
              <Activity size={16} className="text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100">${monthlyIncome.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Budget Progress</CardTitle>
              <Target size={16} className="text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-100">{budgetProgress.toFixed(1)}%</div>
              <div className="w-full bg-slate-800 h-2 mt-3 rounded-full overflow-hidden">
                <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${Math.min(budgetProgress, 100)}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-slate-100">Spend by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-slate-100">Pattern Monitor & Fraud Center</CardTitle>
            </CardHeader>
            <CardContent>
              <FraudCenter />
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(transactions || []).slice(0, 10).map((t) => (
                <div key={t._id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-800 transition-colors hover:bg-slate-800">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${t.status === 'Flagged' ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="font-medium text-slate-100">{t.vendor}</p>
                      <p className="text-sm text-slate-400">{new Date(t.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm px-2 py-1 rounded bg-slate-800 text-slate-300">{t.category}</span>
                    <span className="font-bold text-slate-100">${t.amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <p className="text-slate-400 text-center py-4">No transactions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
