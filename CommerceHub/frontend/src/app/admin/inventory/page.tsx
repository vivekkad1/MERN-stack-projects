"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Save, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SellerInventoryPage() {
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<{[key: string]: number}>({});

async function fetchLowStock() {
    try {
      setLoading(true);
      const res = await api.get('/products/inventory/low-stock');
      if (res.data.success) {
        setLowStockProducts(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch low stock products", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLowStock();
  }, []);

  

  const handleStockChange = (productId: string, newStock: string) => {
    setUpdates(prev => ({
      ...prev,
      [productId]: parseInt(newStock) || 0
    }));
  };

  const handleBulkUpdate = async () => {
    const updateArray = Object.keys(updates).map(productId => ({
      productId,
      stock: updates[productId]
    }));

    if (updateArray.length === 0) return;

    try {
      await api.put('/products/inventory/bulk-update', { updates: updateArray });
      setUpdates({});
      fetchLowStock();
      alert("Inventory updated successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update inventory");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Manage warehouse stock and view low stock alerts.</p>
        </div>
        <Button onClick={handleBulkUpdate} disabled={Object.keys(updates).length === 0} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="p-4 bg-orange-500/10 border-b flex items-center gap-3 text-orange-600">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-semibold">Low Stock Alerts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Current Stock</th>
                <th className="px-6 py-4 font-medium">Alert Threshold</th>
                <th className="px-6 py-4 font-medium w-48 text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lowStockProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">All products have sufficient stock.</td></tr>
              ) : lowStockProducts.map((product) => (
                <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 m-2.5 text-muted-foreground opacity-50" />
                      )}
                    </div>
                    <span className="line-clamp-2">{product.title}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.warehouseLocation || 'Main Warehouse'}
                  </td>
                  <td className="px-6 py-4 text-red-500 font-bold">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {product.lowStockThreshold}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Input 
                      type="number" 
                      min="0"
                      className="w-24 ml-auto" 
                      value={updates[product._id] !== undefined ? updates[product._id] : product.stock}
                      onChange={(e) => handleStockChange(product._id, e.target.value)}
                    />
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
