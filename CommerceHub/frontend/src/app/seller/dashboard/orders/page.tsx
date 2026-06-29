"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/seller/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found containing your products.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium">#{order._id.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.user?.name || 'Guest'}</p>
                    <p className="text-muted-foreground text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full uppercase font-bold tracking-wider">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
