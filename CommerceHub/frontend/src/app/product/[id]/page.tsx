"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Truck, Shield, ArrowLeft, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

// In a real app, this would be fetched from the backend based on params.id
const productData = {
  id: "1",
  title: "Wireless Noise-Cancelling Headphones",
  price: 24999,
  originalPrice: 29999,
  rating: 4.8,
  reviews: 1240,
  description: "Experience industry-leading noise cancellation and breathtaking sound quality. These over-ear headphones offer 30 hours of battery life and extreme comfort for all-day listening.",
  features: [
    "Industry-leading noise cancellation",
    "30-hour battery life with quick charging",
    "Touch sensor controls to pause/play/skip tracks",
    "Speak-to-chat technology automatically reduces volume during conversations",
    "Multipoint connection allows you to pair two Bluetooth devices at the same time"
  ],
  images: [
    "https://via.placeholder.com/600",
    "https://via.placeholder.com/600/111",
    "https://via.placeholder.com/600/333",
    "https://via.placeholder.com/600/555"
  ]
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart } = useCart();

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 min-h-screen">
      <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mb-8 text-muted-foreground")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="aspect-square rounded-2xl bg-muted border overflow-hidden flex items-center justify-center relative">
             <ShoppingCart className="w-32 h-32 text-muted-foreground/20 absolute" />
             {/* Fallback image */}
             <div className="absolute inset-0 bg-primary/5 flex items-center justify-center font-bold text-2xl text-primary/30">
               Product Image {activeImage + 1}
             </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {productData.images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveImage(i)}
                className={`w-20 h-20 rounded-xl bg-muted border-2 flex-shrink-0 flex items-center justify-center transition-all ${activeImage === i ? 'border-primary' : 'border-transparent'}`}
              >
                <span className="text-xs text-muted-foreground">Img {i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {productData.title} (ID: {params.id})
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
            <Button size="lg" className="flex-1 h-14 text-lg gap-2" onClick={() => addToCart({ id: params.id, title: productData.title, price: productData.price })}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
            <Button size="lg" variant="secondary" className="flex-1 h-14 text-lg gap-2" onClick={() => alert("Proceeding to buy...")}>
              Buy Now
            </Button>
            <Button size="icon" variant="outline" className="h-14 w-14 shrink-0" onClick={() => alert("Added to wishlist!")}>
              <Heart className="h-6 w-6" />
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
    </div>
  );
}
