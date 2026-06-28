"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cartItems, incrementQuantity, decrementQuantity, removeFromCart, cartTotal } = useCart();

  const deliveryFee = cartTotal > 500 || cartTotal === 0 ? 0 : 50;
  const total = cartTotal + deliveryFee;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Cart</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1 flex flex-col gap-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 border rounded-2xl bg-card text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>Your cart is empty.</p>
            </div>
          ) : cartItems.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border bg-card">
              <div className="w-24 h-24 bg-muted rounded-xl flex-shrink-0 flex items-center justify-center">
                 <ShoppingCart className="text-muted-foreground/30 h-10 w-10" />
              </div>
              <div className="flex-1 flex flex-col gap-2 text-center sm:text-left w-full">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-primary font-bold text-xl">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-secondary rounded-lg px-3 py-1">
                  <button className="text-secondary-foreground/70 hover:text-foreground transition-colors p-1" onClick={() => decrementQuantity(item.id)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-semibold w-4 text-center">{item.quantity}</span>
                  <button className="text-secondary-foreground/70 hover:text-foreground transition-colors p-1" onClick={() => incrementQuantity(item.id)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="p-6 rounded-2xl border bg-card sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="flex flex-col gap-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium text-green-600">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
              </div>
              <div className="border-t pt-4 mt-2 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <Button className="w-full gap-2" size="lg" onClick={() => alert("Proceed to checkout!")}>
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="mt-4 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
