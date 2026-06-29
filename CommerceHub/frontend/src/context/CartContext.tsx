"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import api from "@/lib/api";

export type CartItem = {
  id: number | string;
  product?: string; // from backend ObjectId
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (id: number | string) => Promise<void>;
  incrementQuantity: (id: number | string) => Promise<void>;
  decrementQuantity: (id: number | string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('minikart_user');

  const fetchCartFromBackend = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      const backendCart = res.data;
      if (backendCart && backendCart.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: CartItem[] = backendCart.items.map((i: any) => ({
          id: i.product._id || i.product, // fallback if not populated
          product: i.product._id || i.product,
          title: i.product.name || 'Product', // Handle unpopulated case
          price: i.priceAtTimeOfAdding || i.product.price || 0,
          quantity: i.quantity,
          image: i.product.images?.[0] || '',
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error("Failed to fetch cart from backend", error);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCartFromBackend().finally(() => setIsLoaded(true));
    } else {
      const savedCart = localStorage.getItem("minikart_cart");
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch {
          console.error("Failed to parse cart from local storage");
        }
      }
      setIsLoaded(true);
    }
  }, [isAuthenticated, fetchCartFromBackend]);

  // Save to local storage on change if not authenticated
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem("minikart_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, isAuthenticated]);

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = item.quantity || 1;
    if (isAuthenticated) {
      try {
        await api.post('/cart', { productId: item.id, quantity: qty });
        await fetchCartFromBackend();
      } catch (err) {
        console.error('Failed to add to cart backend', err);
      }
    } else {
      setCartItems(prev => {
        const existing = prev.find(i => i.id === item.id);
        if (existing) {
          return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i);
        }
        return [...prev, { ...item, quantity: qty }];
      });
    }
  };

  const removeFromCart = async (id: number | string) => {
    if (isAuthenticated) {
      try {
        await api.delete(`/cart/${id}`);
        await fetchCartFromBackend();
      } catch (err) {
        console.error('Failed to remove from cart backend', err);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateQuantity = async (id: number | string, change: number) => {
    if (isAuthenticated) {
      const item = cartItems.find(i => i.id === id);
      if (item) {
        const newQty = item.quantity + change;
        try {
          await api.put(`/cart/${id}`, { quantity: newQty });
          await fetchCartFromBackend();
        } catch (err) {
          console.error('Failed to update cart quantity backend', err);
        }
      }
    } else {
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity: item.quantity + change } : item
      ).filter(item => item.quantity > 0));
    }
  };

  const incrementQuantity = (id: number | string) => updateQuantity(id, 1);
  const decrementQuantity = (id: number | string) => updateQuantity(id, -1);

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
        await fetchCartFromBackend();
      } catch (err) {
        console.error('Failed to clear cart backend', err);
      }
    } else {
      setCartItems([]);
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      incrementQuantity, 
      decrementQuantity, 
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
