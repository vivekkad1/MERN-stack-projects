"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PackageX } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

async function fetchProducts() {
    try {
      // Reusing the public product endpoint since Admin just needs to see them
      const res = await api.get('/products?limit=100'); 
      if (res.data.products) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete product");
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Platform Products</h1>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <PackageX className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{product.title}</p>
                        <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">₹{product.basePrice}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(product._id)}>
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
