"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

async function fetchMyReturns() {
    try {
      const res = await api.get('/returns/myreturns');
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
    fetchMyReturns();
  }, []);

  

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Returns</h1>
          <p className="text-muted-foreground mt-1">Track the status of your return requests</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        {returns.length === 0 ? (
          <div className="p-8 text-center">
            <Undo2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No returns yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">You haven't requested any returns.</p>
            <Link href="/profile/orders">
              <Button variant="outline">View Order History</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {returns.map((req) => (
              <div key={req._id} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Order #{req.order?._id?.substring(0, 8)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                      ${req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        req.status === 'Approved' ? 'bg-blue-500/10 text-blue-500' :
                        req.status === 'Refunded' ? 'bg-green-500/10 text-green-500' :
                        'bg-red-500/10 text-red-500'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Refund Amount: ${req.refundAmount.toFixed(2)}
                  </p>
                </div>
                
                {req.adminComments && (
                  <div className="bg-muted p-3 rounded-md text-sm border flex-1">
                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Admin Note:</p>
                    <p>{req.adminComments}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
