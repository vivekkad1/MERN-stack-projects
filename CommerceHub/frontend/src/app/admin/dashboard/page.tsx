"use client";

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, Package, ShoppingCart, IndianRupee } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={<IndianRupee className="h-5 w-5" />}
          trend={12.5}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Users</h2>
          <div className="space-y-4">
            {stats?.recentUsers?.map((user: any) => (
              <div key={user._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full uppercase font-bold tracking-wider">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {stats?.recentOrders?.map((order: any) => (
              <div key={order._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">{order.user?.name || 'Guest'}</p>
                  <p className="text-sm text-muted-foreground">{order.orderItems?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{order.totalPrice}</p>
                  <span className="text-xs text-muted-foreground">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
