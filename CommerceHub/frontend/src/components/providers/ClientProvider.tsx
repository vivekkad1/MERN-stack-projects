"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
