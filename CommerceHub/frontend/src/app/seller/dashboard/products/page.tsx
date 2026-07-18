"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { buttonVariants } from '@/components/ui/button';
import { PackageX, Plus } from 'lucide-react';
import Link from 'next/link';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await api.get('/seller/products');
      if (res.data.success) {
        setProducts(res.data.data);
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

  if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
        <Link href="/seller/dashboard/products/new" className={buttonVariants({ className: "gap-2" })}>
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    You have not added any products yet.
                  </td>
                </tr>
              )}
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
                      <p className="font-medium line-clamp-1 max-w-[200px]">{product.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{product.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium">₹{product.basePrice}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/product/${product._id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
                      View
                    </Link>
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
