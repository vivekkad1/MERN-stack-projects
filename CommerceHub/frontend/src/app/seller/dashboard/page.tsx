"use client";

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Package, ShoppingCart, IndianRupee, Clock } from 'lucide-react';
import api from '@/lib/api';

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/seller/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch seller stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <StatCard
          title="Active Products"
          value={stats?.totalProducts || 0}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={<Clock className="h-5 w-5" />}
          trend={stats?.pendingOrders > 0 ? 0 : undefined} 
        />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm max-w-2xl">
        <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {stats?.recentOrders?.length === 0 && (
            <p className="text-muted-foreground text-sm">No recent orders found.</p>
          )}
          {stats?.recentOrders?.map((order: any) => (
            <div key={order._id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">Order #{order._id.substring(0, 8)}</p>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full uppercase font-bold tracking-wider">
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
