"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import api from "@/lib/api";

export type WishlistItem = {
  _id: string;
  name: string;
  price: number;
  images: string[];
};

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (productId: string, itemData?: Omit<WishlistItem, '_id'>) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchWishlist = useCallback(async () => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('minikart_user');
    
    if (!isAuthenticated) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem("minikart_wishlist") : null;
      if (saved) {
        try {
          setWishlistItems(JSON.parse(saved));
        } catch(e) {}
      }
      setIsLoading(false);
      setIsLoaded(true);
      return;
    }
    
    try {
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setWishlistItems(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  useEffect(() => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('minikart_user');
    if (isLoaded && (!isAuthenticated || wishlistItems.some(i => i._id.length < 10))) {
      localStorage.setItem("minikart_wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = async (productId: string, itemData?: Omit<WishlistItem, '_id'>) => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('minikart_user');
    
    if (isAuthenticated) {
      try {
        const res = await api.post(`/wishlist/${productId}`);
        if (res.data.success) {
          setWishlistItems(res.data.data);
        }
      } catch (error: any) {
        console.error("Failed to add to wishlist:", error);
        // Fallback for dummy products even when authenticated
        if (error.response?.status === 404 && itemData) {
          setWishlistItems(prev => {
            if (prev.some(item => item._id === productId)) return prev;
            return [...prev, { _id: productId, ...itemData }];
          });
        } else {
          alert("Failed to add to wishlist. Is the server running?");
        }
      }
    } else {
      setWishlistItems(prev => {
        if (prev.some(item => item._id === productId)) return prev;
        return [...prev, { _id: productId, name: itemData?.name || 'Product', price: itemData?.price || 0, images: itemData?.images || [] }];
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('minikart_user');
    
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/wishlist/${productId}`);
        if (res.data.success) {
          setWishlistItems(res.data.data);
        }
      } catch (error: any) {
        // Fallback for removing dummy products
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      }
    } else {
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
