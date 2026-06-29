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
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('minikart_user');
      if (!userInfo) {
        setIsLoading(false);
        return;
      }
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
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    try {
      const res = await api.post(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlistItems(res.data.data);
      }
    } catch (error: any) {
      console.error("Failed to add to wishlist:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Please login to add items to wishlist");
      } else if (error.response?.status === 404) {
        alert("Product not found in database (Dummy products cannot be added)");
      } else {
        alert("Failed to add to wishlist. Is the server running?");
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data.success) {
        setWishlistItems(res.data.data);
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
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
