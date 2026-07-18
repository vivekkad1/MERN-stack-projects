"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    usageLimit: 1
  });

  async function fetchCoupons() {
    try {
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch coupons", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      setShowForm(false);
      fetchCoupons();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (error) {
      console.error("Failed to delete coupon", error);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Store Coupons</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Create Coupon</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-6 bg-card rounded-xl border space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Coupon Code</label>
              <input 
                required 
                className="w-full p-2 rounded-md border bg-background" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                placeholder="e.g. SUMMER20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Type</label>
              <select 
                className="w-full p-2 rounded-md border bg-background"
                value={formData.discountType}
                onChange={e => setFormData({...formData, discountType: e.target.value})}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount Value</label>
              <input 
                required 
                type="number" 
                className="w-full p-2 rounded-md border bg-background" 
                value={formData.discountValue} 
                onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Order Value</label>
              <input 
                type="number" 
                className="w-full p-2 rounded-md border bg-background" 
                value={formData.minOrderValue} 
                onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <input 
                required 
                type="date" 
                className="w-full p-2 rounded-md border bg-background" 
                value={formData.startDate} 
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <input 
                required 
                type="date" 
                className="w-full p-2 rounded-md border bg-background" 
                value={formData.endDate} 
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Usage Limit</label>
              <input 
                required 
                type="number" 
                className="w-full p-2 rounded-md border bg-background" 
                value={formData.usageLimit} 
                onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
              />
            </div>
          </div>
          <Button type="submit">Save Coupon</Button>
        </form>
      )}

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Valid Until</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No coupons found</td></tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {coupon.usedCount} / {coupon.usageLimit}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(coupon.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(coupon._id)}>
                      Delete
                    </Button>
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
