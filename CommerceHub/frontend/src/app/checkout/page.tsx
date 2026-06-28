"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  useEffect(() => {
    // If cart is empty and not on success step, go to cart
    if (cartItems.length === 0 && step !== 4) {
      router.push("/cart");
    }
  }, [cartItems, step, router]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice: 0,
        shippingPrice: cartTotal > 500 ? 0 : 50,
        totalPrice: cartTotal + (cartTotal > 500 ? 0 : 50)
      };

      await api.post('/orders', orderData);
      await clearCart();
      setStep(4); // Success step
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again or login.");
    } finally {
      setLoading(false);
    }
  };

  const deliveryFee = cartTotal > 500 || cartTotal === 0 ? 0 : 50;
  const total = cartTotal + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-12 min-h-[80vh]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full overflow-hidden">
             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background font-bold ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
          ))}
        </div>

        {/* Step 1: Shipping Address */}
        {step === 1 && (
          <div className="bg-card p-6 md:p-8 rounded-2xl border">
            <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" value={address.fullName} onChange={handleAddressChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={address.phone} onChange={handleAddressChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input id="addressLine2" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={address.city} onChange={handleAddressChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={address.state} onChange={handleAddressChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleAddressChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={address.country} disabled />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={handleNextStep} disabled={!address.fullName || !address.addressLine1 || !address.city || !address.postalCode || !address.phone}>
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === 2 && (
          <div className="bg-card p-6 md:p-8 rounded-2xl border">
            <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
            <div className="space-y-4">
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}>
                <input type="radio" name="payment" value="Cash on Delivery" checked={paymentMethod === 'Cash on Delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-primary" />
                <span className="font-medium text-lg">Cash on Delivery</span>
              </label>
              <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer opacity-50`}>
                <input type="radio" name="payment" value="Stripe" disabled className="w-5 h-5" />
                <span className="font-medium text-lg">Credit Card (Stripe) <span className="text-sm text-muted-foreground ml-2">(Coming in Phase 2)</span></span>
              </label>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNextStep}>Review Order</Button>
            </div>
          </div>
        )}

        {/* Step 3: Review Order */}
        {step === 3 && (
          <div className="bg-card p-6 md:p-8 rounded-2xl border flex flex-col md:flex-row gap-12">
            <div className="flex-1 space-y-8">
              <h2 className="text-2xl font-semibold">Review Your Order</h2>
              
              <div>
                <h3 className="text-lg font-medium text-muted-foreground mb-3">Shipping Address</h3>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="font-medium">{address.fullName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-muted-foreground mb-3">Payment Method</h3>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="font-medium">{paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[350px]">
              <div className="p-6 bg-muted/30 rounded-xl border sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 text-sm mb-6">
                   <div className="flex justify-between text-muted-foreground">
                     <span>Items:</span>
                     <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                   </div>
                   <div className="flex justify-between text-muted-foreground">
                     <span>Delivery:</span>
                     <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                   </div>
                   <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
                     <span>Total:</span>
                     <span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
                   </div>
                </div>
                <div className="flex justify-between gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                  <Button onClick={handlePlaceOrder} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Place Order'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-card p-12 rounded-2xl border text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Thank you for shopping with Minikart. We've received your order and will process it shortly.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/profile')}>View Orders</Button>
              <Button onClick={() => router.push('/')}>Continue Shopping</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
