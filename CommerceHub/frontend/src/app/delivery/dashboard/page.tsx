"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Package, Truck } from 'lucide-react';

export default function DeliveryDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofUrl, setProofUrl] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/delivery/assignments');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const payload: any = { status };
      if (status === 'Delivered' && proofUrl) {
        payload.proofOfDelivery = proofUrl;
      }
      
      await api.put(`/delivery/orders/${id}/status`, payload);
      setProofUrl('');
      fetchAssignments();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Deliveries</h1>
      </div>

      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="p-12 border rounded-xl bg-card text-center text-muted-foreground">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No active assignments</h3>
            <p>You have not been assigned any orders for delivery yet.</p>
          </div>
        ) : orders.map(order => (
          <div key={order._id} className="p-6 border rounded-xl bg-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Order #{order._id.substring(0, 8)}</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {order.status}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mt-2">
                <p className="font-medium text-foreground mb-1">Delivery Address:</p>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p className="font-medium text-foreground mt-2">Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {order.status === 'Shipped' && (
                <Button onClick={() => handleStatusChange(order._id, 'Out for Delivery')}>
                  Mark Out for Delivery
                </Button>
              )}
              
              {order.status === 'Out for Delivery' && (
                <>
                  <input 
                    type="text" 
                    placeholder="Proof of Delivery Image URL" 
                    className="p-2 text-sm border rounded bg-background"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                  />
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange(order._id, 'Delivered')}>
                    Mark Delivered
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleStatusChange(order._id, 'Attempted')}>
                    Mark Attempted
                  </Button>
                </>
              )}
              
              {order.status === 'Attempted' && (
                <Button onClick={() => handleStatusChange(order._id, 'Out for Delivery')}>
                  Retry Delivery
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
