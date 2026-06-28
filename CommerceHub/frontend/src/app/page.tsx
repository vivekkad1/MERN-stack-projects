"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Zap, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();

  const trendingProducts = [
    { id: 1, title: 'boAt Airdopes 141', desc: 'True Wireless Earbuds with 42H Playtime.', price: '₹1,299', rating: 4.2, label: 'Bestseller' },
    { id: 2, title: 'OnePlus Nord CE 3 Lite', desc: 'Pastel Lime, 8GB RAM, 128GB Storage, 108MP Camera.', price: '₹19,999', rating: 4.8, label: 'Trending' },
    { id: 3, title: 'Kanjivaram Silk Saree', desc: 'Authentic pure silk saree with zari border for festive wear.', price: '₹4,599', rating: 4.7, label: 'Premium' },
    { id: 4, title: 'Pigeon Handy Mini Chopper', desc: 'Plastic Chopper with 3 Blades for daily kitchen use, Green.', price: '₹249', rating: 4.5, label: 'Deal' }
  ];

  return (
    <div className="flex flex-col gap-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        {/* Background gradient/image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 -z-10" />
        
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              Big Indian Festival Sale is Here!
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              India's Premium <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Shopping Destination
              </span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-[600px] mx-auto md:mx-0">
              Shop millions of products from verified Indian sellers with fast home delivery, easy UPI payments, and secure returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/categories" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                Start Shopping <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sell" className={buttonVariants({ size: "lg", variant: "outline" })}>
                Sell Across India
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center md:justify-end mt-8 md:mt-0">
            <div className="relative w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              {/* Fallback image if no real image is provided */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 md:w-32 md:h-32 text-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
          <Link href="/categories" className={buttonVariants({ variant: "ghost" })}>View All Categories</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Mobiles', 'Fashion', 'Home Appliances', 'Beauty', 'Groceries', 'Electronics'].map((category, i) => (
            <div key={i} className="group cursor-pointer flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border bg-card hover:border-primary transition-all hover:shadow-md">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <span className="font-medium text-xs md:text-sm text-center">{category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Trending in India</h2>
          </div>
          <Link href="/categories" className={buttonVariants({ variant: "ghost" })}>See More</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {trendingProducts.map((item) => (
            <div key={item.id} className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-square bg-muted/50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-1.5 md:gap-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs font-semibold text-primary uppercase tracking-wider">{item.label}</span>
                  <div className="flex items-center gap-1 text-[10px] md:text-xs">
                    <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <Link href={`/product/${item.id}`} className="before:absolute before:inset-0">
                  <h3 className="font-semibold text-sm md:text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                </Link>
                <div className="mt-auto pt-2 md:pt-4 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-lg md:text-xl font-bold">{item.price}</span>
                  <div className="flex gap-2 relative z-10 w-full sm:w-auto">
                    <Button size="sm" className="w-full sm:w-auto text-xs h-7 md:h-8" variant="outline" onClick={() => addToCart({ id: item.id, title: item.title, price: parseInt(item.price.replace(/[^\d]/g, '')) })}>Add</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10 space-y-3 md:space-y-4 max-w-lg text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Extra ₹500 Off Your First Order</h2>
            <p className="text-primary-foreground/80 text-base sm:text-lg">
              Sign up today and receive an exclusive discount code. Use UPI for lightning-fast payments!
            </p>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <form className="flex gap-2 w-full max-w-sm" suppressHydrationWarning>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                suppressHydrationWarning
              />
              <Button variant="secondary" type="submit" onClick={(e) => { e.preventDefault(); alert('Subscribed!') }} suppressHydrationWarning>Subscribe</Button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
