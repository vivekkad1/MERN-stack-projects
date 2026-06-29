"use client";



import Link from "next/link";
import { 
  ShoppingBag, Shirt, Smartphone, Sparkles, Monitor, Home, 
  ShoppingCart, Watch, BookOpen, Dumbbell, Music 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";


const categories = [
  { name: "For You", icon: ShoppingBag, href: "/" },
  { name: "Mobiles", icon: Smartphone, href: "/categories/mobiles" },
  { name: "Fashion", icon: Shirt, href: "/categories/fashion" },
  { name: "Appliances", icon: Home, href: "/categories/home-appliances" },
  { name: "Beauty", icon: Sparkles, href: "/categories/beauty" },
  { name: "Groceries", icon: ShoppingCart, href: "/categories/groceries" },
  { name: "Electronics", icon: Monitor, href: "/categories/electronics" },
  { name: "Watches", icon: Watch, href: "/categories/watches" },
  { name: "Books", icon: BookOpen, href: "/categories/books" },
  { name: "Sports", icon: Dumbbell, href: "/categories/sports" },
  { name: "Music", icon: Music, href: "/categories/music" }
];

export function CategoryNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/product/")) {
    return null;
  }

  return (
    <div className="w-full bg-background border-b overflow-hidden shadow-sm">
      <div className="container mx-auto px-2 sm:px-4 lg:px-8">
        {/* Hide scrollbar for cleaner look on small screens */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-2">
          {categories.map((category) => {
            const isActive = pathname === category.href || (category.href === "/" && pathname === "/");
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                href={category.href}
                className={cn(
                  "group flex flex-col items-center gap-1 min-w-[70px] shrink-0 pb-1.5 border-b-2 transition-colors",
                  isActive ? "border-blue-600 text-foreground" : "border-transparent text-foreground hover:text-primary"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative",
                  isActive ? "bg-blue-100/50" : "bg-transparent group-hover:bg-muted"
                )}>
                  {/* Subtle yellow highlight simulation for the icons */}
                  {!isActive && <div className="absolute inset-0 m-auto w-5 h-5 bg-yellow-400/20 rounded-full -z-10" />}
                  <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-700 dark:text-slate-300")} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={cn("text-[11px] leading-none whitespace-nowrap", isActive ? "font-bold" : "font-medium")}>
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
