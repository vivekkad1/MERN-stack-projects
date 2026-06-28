"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Suspense } from "react";

const allProducts = [
  { id: 1, title: 'boAt Airdopes 141', desc: 'True Wireless Earbuds with 42H Playtime.', price: '₹1,299', rating: 4.2, tags: ['audio', 'earbuds', 'music'] },
  { id: 2, title: 'OnePlus Nord CE 3 Lite', desc: 'Pastel Lime, 8GB RAM, 128GB Storage, 108MP Camera.', price: '₹19,999', rating: 4.8, tags: ['mobile', 'phone', 'smartphone'] },
  { id: 3, title: 'Kanjivaram Silk Saree', desc: 'Authentic pure silk saree with zari border for festive wear.', price: '₹4,599', rating: 4.7, tags: ['fashion', 'clothing', 'saree', 'women'] },
  { id: 4, title: 'Pigeon Handy Mini Chopper', desc: 'Plastic Chopper with 3 Blades for daily kitchen use, Green.', price: '₹249', rating: 4.5, tags: ['home', 'kitchen', 'chopper', 'appliance'] },
  { id: 101, title: 'Sony WH-1000XM5', desc: 'Industry leading noise canceling headphones.', price: '₹29,990', rating: 4.9, tags: ['audio', 'headphones', 'music', 'headset'] },
  { id: 102, title: 'Apple Watch Series 9', desc: 'Smartwatch with Midnight Aluminum Case.', price: '₹41,900', rating: 4.8, tags: ['wearable', 'watch', 'smartwatch', 'apple'] },
  { id: 'deal-1', title: 'Sony PS5 Console', desc: 'Next-gen gaming console with ultra-high speed SSD.', price: '₹44,990', rating: 4.9, tags: ['gaming', 'console', 'ps5', 'sony'] },
  { id: 'deal-2', title: 'Samsung 55" 4K Smart TV', desc: 'Crystal 4K UHD Smart TV with vivid colors.', price: '₹42,990', rating: 4.6, tags: ['tv', 'television', 'home entertainment', 'samsung'] }
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { addToCart } = useCart();

  const normalizedQuery = query.toLowerCase().replace(/s$/, ""); // Basic singularization (phones -> phone)
  // Use word boundaries so "phone" matches "phone" but not the middle of "headphones"
  const searchRegex = new RegExp(`\\b${normalizedQuery}`, 'i');

  const filteredProducts = allProducts.filter(p => {
    return searchRegex.test(p.title) || 
           searchRegex.test(p.desc) || 
           (p.tags && p.tags.some(tag => tag.includes(normalizedQuery)));
  });

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for &quot;{query}&quot;
      </h1>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-xl">No products found matching your search.</p>
          <p className="mt-2">Try different keywords or check your spelling.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((item) => (
            <div key={item.id} className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-square bg-muted/50 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-end">
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
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}
