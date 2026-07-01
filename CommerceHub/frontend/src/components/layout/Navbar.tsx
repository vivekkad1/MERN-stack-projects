"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, Moon, Sun, MapPin, ChevronDown, ShoppingBag } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
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
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState({ city: "Select Location", pincode: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await api.get(`/products?keyword=${encodeURIComponent(searchQuery.trim())}&limit=5`);
          if (res.data && res.data.products) {
            setSuggestions(res.data.products);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Failed to fetch suggestions", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      // Fire and forget to save search history only if logged in
      if (user) {
        api.post('/history/search', { query: searchQuery.trim() }).catch(console.error);
      }
      
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
          } catch {
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
                Minikart
              </span>
            </Link>
            
            <div className="hidden md:flex items-center ml-6 cursor-pointer text-sm text-muted-foreground hover:text-primary transition-colors w-[140px]" onClick={fetchLocation}>
              <MapPin className="h-4 w-4 mr-1 text-primary shrink-0" />
              <div className="flex flex-col text-left leading-tight w-full">
                <span className="text-[10px] opacity-70">Deliver to</span>
                <span className="font-semibold text-xs truncate w-[110px]">{location.city}</span>
                {location.pincode && <span className="font-bold text-[10px] text-primary truncate w-[110px]">{location.pincode}</span>}
              </div>
            </div>
          </div>

          {/* Desktop Navigation & Search */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <form ref={searchRef} onSubmit={handleSearch} className="w-full max-w-lg relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => { if (searchQuery.trim().length > 1) setShowSuggestions(true); }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-input rounded-full leading-5 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Search products, brands and categories..."
                suppressHydrationWarning
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg overflow-hidden z-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-col">
                      {suggestions.map((item) => (
                        <div 
                          key={item._id} 
                          onClick={() => { setShowSuggestions(false); router.push(`/product/${item._id}`); }}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                        >
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center">
                            {item.images && item.images[0] ? (
                              <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{item.title}</span>
                            <span className="text-xs text-muted-foreground">₹{item.discountPrice || item.basePrice}</span>
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={handleSearch}
                        className="p-2 text-center text-xs font-semibold text-primary hover:bg-muted/50 cursor-pointer bg-muted/20"
                      >
                        View all results for "{searchQuery}"
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
                  )}
                </div>
              )}
            </form>

          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost" }), "outline-none gap-2 px-2")} suppressHydrationWarning>
                <User className="h-5 w-5" />
                <span className="font-medium hidden sm:inline-block">Vivek</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
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

            <Link href="/cart" className={cn(buttonVariants({ variant: "ghost" }), "gap-2 px-2 relative")}>
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium hidden sm:inline-block">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 top-16 z-40">
          <form ref={mobileSearchRef} onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }} className="w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => { if (searchQuery.trim().length > 1) setShowSuggestions(true); }}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-input rounded-full leading-5 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
              placeholder="Search products..."
              suppressHydrationWarning
            />
            
            {/* Mobile Autocomplete Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : suggestions.length > 0 ? (
                  <div className="flex flex-col">
                    {suggestions.map((item) => (
                      <div 
                        key={item._id} 
                        onClick={() => { setShowSuggestions(false); setIsMobileMenuOpen(false); router.push(`/product/${item._id}`); }}
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors"
                      >
                        <div className="w-10 h-10 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center">
                          {item.images && item.images[0] ? (
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium truncate">{item.title}</span>
                          <span className="text-xs text-muted-foreground">₹{item.discountPrice || item.basePrice}</span>
                        </div>
                      </div>
                    ))}
                    <div 
                      onClick={(e) => { handleSearch(e as any); setIsMobileMenuOpen(false); }}
                      className="p-3 text-center text-sm font-semibold text-primary hover:bg-muted/50 cursor-pointer bg-muted/20"
                    >
                      View all results
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">No products found</div>
                )}
              </div>
            )}
          </form>

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
