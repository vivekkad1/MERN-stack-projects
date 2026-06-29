"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Loader2, X } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    stock: '',
    category: 'Electronics', // In a real app, fetch from /api/categories
  });
  
  const [images, setImages] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
      const file = e.target.files[0];
      const data = new FormData();
      data.append('image', file);

      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setImages([...images, res.data.url]);
      } else {
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload image. Missing Cloudinary API keys?");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setLoading(true);
    try {
      // Get category ID (Mocking it here, ideally you have a dropdown of IDs)
      // For this demo, let's assume the backend takes a category string or we fetch one
      // We will just hit the product endpoint
      
      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        stock: Number(formData.stock),
        images,
        // Using a hardcoded category ID for the demo since we don't have a category picker yet
        // A real app would let user select from fetched categories
        category: "60d0fe4f5311236168a109ca" 
      };

      const res = await api.post('/products', payload);
      
      if (res.data) {
        router.push('/seller/dashboard/products');
      }
    } catch (error) {
      console.error("Failed to create product", error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6 bg-card p-6 rounded-xl border">
          
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. iPhone 15 Pro Max" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Price (₹)</Label>
              <Input id="basePrice" name="basePrice" type="number" min="0" value={formData.basePrice} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="flex flex-wrap gap-4 mb-4">
              {images.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <label className="w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] text-muted-foreground">Upload</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={5} />
          </div>

        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading || uploading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Publish Product
          </Button>
        </div>
      </form>
    </div>
  );
}
