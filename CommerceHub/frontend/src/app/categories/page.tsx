"use client";

import Link from "next/link";
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Sparkles, 
  ShoppingCart, 
  Monitor, 
  Watch, 
  BookOpen, 
  Dumbbell, 
  Music 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { id: 1, name: "Mobiles & Tablets", slug: "mobiles", icon: Smartphone, count: 1240, color: "bg-blue-500/10 text-blue-500" },
  { id: 2, name: "Fashion & Apparel", slug: "fashion", icon: Shirt, count: 8530, color: "bg-pink-500/10 text-pink-500" },
  { id: 3, name: "Home Appliances", slug: "home-appliances", icon: Home, count: 620, color: "bg-orange-500/10 text-orange-500" },
  { id: 4, name: "Beauty & Personal Care", slug: "beauty", icon: Sparkles, count: 3200, color: "bg-purple-500/10 text-purple-500" },
  { id: 5, name: "Groceries", slug: "groceries", icon: ShoppingCart, count: 410, color: "bg-green-500/10 text-green-500" },
  { id: 6, name: "Electronics", slug: "electronics", icon: Monitor, count: 1530, color: "bg-indigo-500/10 text-indigo-500" },
  { id: 7, name: "Watches & Accessories", slug: "watches", icon: Watch, count: 980, color: "bg-slate-500/10 text-slate-500" },
  { id: 8, name: "Books", slug: "books", icon: BookOpen, count: 2100, color: "bg-amber-500/10 text-amber-500" },
  { id: 9, name: "Fitness & Sports", slug: "sports", icon: Dumbbell, count: 740, color: "bg-red-500/10 text-red-500" },
  { id: 10, name: "Musical Instruments", slug: "music", icon: Music, count: 320, color: "bg-teal-500/10 text-teal-500" }
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Browse Categories</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Explore our wide range of products across different categories. Find exactly what you need from top brands and trusted sellers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border bg-card hover:border-primary transition-all hover:shadow-lg text-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${category.color}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.count.toLocaleString('en-IN')} products
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-secondary text-secondary-foreground flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold">Can't find what you're looking for?</h3>
          <p className="opacity-80 mt-2">Try searching our entire catalog of millions of products.</p>
        </div>
        <div className="w-full md:w-auto flex-1 max-w-md">
           <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); alert('Search functionality coming soon!'); }}>
            <input
              type="text"
              placeholder="Search products..."
              className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            />
            <Button size="lg">Search</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
