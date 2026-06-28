"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const newArrivals = [
  { id: 101, title: 'Sony WH-1000XM5', desc: 'Industry leading noise canceling headphones.', price: '₹29,990', rating: 4.9, label: 'New' },
  { id: 102, title: 'Apple Watch Series 9', desc: 'Smarter, brighter, mightier.', price: '₹41,900', rating: 4.8, label: 'New' },
  { id: 103, title: 'Samsung Galaxy S24 Ultra', desc: 'Galaxy AI is here.', price: '₹1,29,999', rating: 4.9, label: 'New' },
  { id: 104, title: 'Nike Air Max Pulse', desc: 'Mens shoes with iconic design.', price: '₹13,995', rating: 4.7, label: 'New' },
  { id: 105, title: 'Dyson Airwrap', desc: 'Multi-styler Complete Long.', price: '₹45,900', rating: 4.8, label: 'New' },
  { id: 106, title: 'PlayStation 5 Slim', desc: 'Next-gen gaming console.', price: '₹44,990', rating: 4.9, label: 'New' },
  { id: 107, title: 'Kindle Paperwhite', desc: 'Now with a 6.8" display and thinner borders.', price: '₹13,999', rating: 4.6, label: 'New' },
  { id: 108, title: 'Lego Star Wars Millennium Falcon', desc: 'Ultimate Collector Series.', price: '₹74,999', rating: 4.9, label: 'New' },
];

export default function NewArrivalsPage() {
  const { addToCart } = useCart();

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">New Arrivals</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mt-2">
          Discover the latest and greatest products just added to our store. Stay ahead of the trends with these fresh drops!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {newArrivals.map((item) => (
          <div key={item.id} className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-square bg-muted/50 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm z-20">
                NEW
              </div>
            </div>
            <div className="p-5 flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{item.label}</span>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{item.rating}</span>
                </div>
              </div>
              <Link href={`/product/${item.id}`} className="before:absolute before:inset-0">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
              </Link>
              <p className="text-muted-foreground text-sm line-clamp-2">{item.desc}</p>
              <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xl font-bold">{item.price}</span>
                <div className="flex gap-2 relative z-10">
                  <Button size="sm" variant="outline" onClick={() => addToCart({ id: item.id, title: item.title, price: parseInt(item.price.replace(/[^\d]/g, '')) })}>Add to Cart</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
