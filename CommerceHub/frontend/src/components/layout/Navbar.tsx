"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, Moon, Sun, MapPin } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { cartCount } = useCart();
  const router = useRouter();
  const [location, setLocation] = useState({ city: "Select Location", pincode: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      setLocation({ city: "Fetching...", pincode: "" });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.state || "Current Location";
            const pincode = data.address.postcode || "";
            setLocation({ city, pincode });
          } catch (error) {
            setLocation({ city: "Location Found", pincode: "" });
          }
        },
        () => {
          setLocation({ city: "Location Denied", pincode: "" });
        }
      );
    } else {
      setLocation({ city: "Not Supported", pincode: "" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                CommerceHub
              </span>
            </Link>
            
            <div className="hidden md:flex items-center ml-6 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors" onClick={fetchLocation}>
              <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] opacity-70">Deliver to</span>
                <span className="font-semibold text-xs truncate max-w-[120px]">{location.city}</span>
                {location.pincode && <span className="font-bold text-[10px] text-primary">{location.pincode}</span>}
              </div>
            </div>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <form onSubmit={handleSearch} className="w-full max-w-lg relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-full leading-5 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Search products, brands and categories..."
              />
            </form>
            <nav className="ml-8 flex items-center gap-6 text-sm font-medium">
              <Link href="/categories" className="transition-colors hover:text-primary">Categories</Link>
              <Link href="/deals" className="transition-colors hover:text-primary">Deals</Link>
              <Link href="/new" className="transition-colors hover:text-primary">New Arrivals</Link>
            </nav>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <Link href="/cart" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full outline-none")}>
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=account')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=orders')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Orders</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=wishlist')}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile?tab=settings')}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => alert('Sign Out coming soon!')}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 top-16 z-40">
          <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-input rounded-full leading-5 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
              placeholder="Search products..."
            />
          </form>
          <nav className="flex flex-col gap-4 text-sm font-medium">
            <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary">Categories</Link>
            <Link href="/deals" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary">Deals</Link>
            <Link href="/new" onClick={() => setIsMobileMenuOpen(false)} className="transition-colors hover:text-primary">New Arrivals</Link>
          </nav>
          <div className="pt-2 border-t flex items-center cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors" onClick={fetchLocation}>
            <MapPin className="h-4 w-4 mr-2 text-primary shrink-0" />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] opacity-70">Deliver to</span>
              <span className="font-semibold text-xs truncate max-w-[200px]">{location.city}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
