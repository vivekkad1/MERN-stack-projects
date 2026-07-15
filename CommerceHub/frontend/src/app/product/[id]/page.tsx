"use client";

import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import api from "@/lib/api";

import { getProductById } from "@/lib/mockData";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productData = getProductById(id);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(id);
  
  const handleWishlistClick = () => {
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id, { 
        name: productData.title, 
        price: productData.price, 
        images: productData.images 
      });
    }
  };

  useEffect(() => {
    if (id) {
      api.post('/history/view', { productId: id }).catch(() => {});
    }
  }, [id]);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square rounded-2xl bg-muted border overflow-hidden flex items-center justify-center relative">
             <img src={productData.images[activeImage]} alt={productData.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {productData.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl bg-muted border-2 flex-shrink-0 flex items-center justify-center overflow-hidden transition-all ${activeImage === i ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {productData.title} (ID: {id})
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-5 w-5 ${star <= Math.floor(productData.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
              ))}
            </div>
            <span className="text-muted-foreground text-sm font-medium hover:underline cursor-pointer">
              {productData.reviews.toLocaleString('en-IN')} Ratings
            </span>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-extrabold text-primary">₹{productData.price.toLocaleString('en-IN')}</span>
            <span className="text-xl text-muted-foreground line-through mb-1">₹{productData.originalPrice.toLocaleString('en-IN')}</span>
            <span className="text-sm font-bold text-green-600 mb-2 ml-2">
              {Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100)}% OFF
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button size="lg" className="flex-1 h-14 text-lg gap-2" onClick={() => addToCart({ id, title: productData.title, price: productData.price })}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
            <Button size="lg" variant="secondary" className="flex-1 h-14 text-lg gap-2" onClick={() => alert("Proceeding to buy...")}>
              Buy Now
            </Button>
            <Button size="icon" variant="outline" className="h-14 w-14 shrink-0" onClick={handleWishlistClick}>
              <Heart className={`h-6 w-6 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {productData.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Key Features</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {productData.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Guarantees */}
          <div className="flex flex-col sm:flex-row gap-6 mt-12 pt-8 border-t">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On orders over ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">1 Year Warranty</p>
                <p className="text-xs text-muted-foreground">Brand authorized seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold mb-6">Relevant Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop", name: "Premium Watch" },
            { img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop", name: "Camera Lens" },
            { img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop", name: "Running Shoes" },
            { img: "https://images.unsplash.com/photo-1572569531935-c2eec7ebcc79?q=80&w=400&auto=format&fit=crop", name: "Travel Backpack" },
            { img: "https://images.unsplash.com/photo-1585386959920-141b015f8342?q=80&w=400&auto=format&fit=crop", name: "Smartphone Case" }
          ].map((item, i) => (
            <Link key={i} href={`/product/${i + 10}`} className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-square bg-muted/50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-sm">₹{(i * 1000 + 15000).toLocaleString('en-IN')}</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>4.{i + 3}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
