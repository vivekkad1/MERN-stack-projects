"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

export default function SellerReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReturns() {
    try {
      const res = await api.get('/returns');
      if (res.data.success) {
        setReturns(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch returns", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/returns/${id}/status`, { status });
      fetchReturns();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update return status");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Store Return Requests</h1>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Refund Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {returns.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No return requests found for your products.</td></tr>
              ) : returns.map((req) => (
                <tr key={req._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <Undo2 className="w-4 h-4 text-primary" />
                    {req.order?._id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    {req.user?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        req.status === 'Approved' ? 'bg-blue-500/10 text-blue-500' :
                        req.status === 'Refunded' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    ${req.refundAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {req.status === 'Pending' && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600" onClick={() => handleStatusChange(req._id, 'Approved')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={() => handleStatusChange(req._id, 'Rejected')}>
                          Reject
                        </Button>
                      </>
                    )}
                    {req.status === 'Approved' && (
                      <Button size="sm" variant="default" onClick={() => handleStatusChange(req._id, 'Refunded')}>
                        Process Refund
                      </Button>
                    )}
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
