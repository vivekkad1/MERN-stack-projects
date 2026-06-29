"use client";

import { Button } from "@/components/ui/button";
import { Star, Clock } from "lucide-react";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function DealsPage() {
  const { addToCart } = useCart();

  const deals = [
    { id: 1, title: 'Sony PS5 Console', oldPrice: '₹54,990', newPrice: '₹44,990', discount: '18% OFF', rating: 4.9, timeEnds: '10h 23m' },
    { id: 2, title: 'Samsung 55" 4K Smart TV', oldPrice: '₹64,900', newPrice: '₹42,990', discount: '33% OFF', rating: 4.6, timeEnds: '04h 15m' },
    { id: 3, title: 'LG 1.5 Ton Inverter AC', oldPrice: '₹59,990', newPrice: '₹37,490', discount: '37% OFF', rating: 4.5, timeEnds: '12h 45m' },
    { id: 4, title: 'Nike Air Max Running Shoes', oldPrice: '₹12,495', newPrice: '₹7,495', discount: '40% OFF', rating: 4.4, timeEnds: '01h 12m' },
  ];

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-red-500 flex items-center gap-3">
          Daily Deals 
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-600 border-red-200">
            Live Now
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Grab the best discounts before they expire. Quantities are limited!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        {deals.map((deal) => (
          <div key={deal.id} className="group relative flex flex-col rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-xl transition-all border-red-100 dark:border-red-900">
            <div className="absolute top-3 left-3 z-20 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {deal.discount}
            </div>
            
            <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden flex items-center justify-center p-6">
               <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
               <div className="w-full h-full rounded-xl bg-muted animate-pulse" />
            </div>
            
            <div className="p-5 flex flex-col gap-3 flex-1">
              <div className="flex items-center justify-between text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-md w-fit">
                <Clock className="h-3 w-3 mr-1" /> Ends in {deal.timeEnds}
              </div>
              <Link href={`/product/${deal.id}`} className="before:absolute before:inset-0">
                <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">{deal.title}</h3>
              </Link>
              
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{deal.rating}</span>
              </div>
              
              <div className="mt-auto pt-2">
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{deal.newPrice}</span>
                  <span className="text-sm text-muted-foreground line-through mb-1">{deal.oldPrice}</span>
                </div>
                <div className="relative z-10">
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={() => addToCart({ id: `deal-${deal.id}`, title: deal.title, price: parseInt(deal.newPrice.replace(/[^\d]/g, '')) })}>Claim Deal</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
