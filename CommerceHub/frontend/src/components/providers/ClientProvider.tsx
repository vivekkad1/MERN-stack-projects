"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "next-themes";

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <CartProvider>
        {children}
      </CartProvider>
    </ThemeProvider>
  );
}
