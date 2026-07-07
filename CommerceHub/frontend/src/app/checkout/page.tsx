"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { CheckCircle2, Loader2, CreditCard, Banknote } from "lucide-react";
import { loadScript } from "@/lib/loadScript";

// Type declaration for Razorpay attached to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

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
      const deliveryFee = cartTotal > 500 || cartTotal === 0 ? 0 : 50;
      const totalAmount = cartTotal + deliveryFee;

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
        shippingPrice: deliveryFee,
        totalPrice: totalAmount,
        couponCode: appliedCoupon?.code,
        couponDiscount: discountAmount
      };

      if (paymentMethod === "Cash on Delivery") {
        await api.post('/orders', orderData);
        await clearCart();
        setStep(4); // Success step
      } else if (paymentMethod === "Razorpay") {
        // 1. Load Razorpay script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          setLoading(false);
          return;
        }

        // 2. Create Razorpay order on backend
        const orderResponse = await api.post('/payments/razorpay/create-order', {
          amount: totalAmount
        });

        if (!orderResponse.data.success) {
          alert("Server error. Please try again.");
          setLoading(false);
          return;
        }

        const { id, amount, currency, mocked } = orderResponse.data.data;

        // 3. Initialize Razorpay options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy_key", 
          amount: amount.toString(),
          currency: currency,
          name: "CommerceHub",
          description: "Test Transaction",
          order_id: id,
          handler: async function (response: any) {
            try {
              // 4. Verify Payment on backend
              const verifyRes = await api.post('/payments/razorpay/verify', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature || "mock_signature",
                orderData
              });

              if (verifyRes.data.success) {
                await clearCart();
                setStep(4);
              }
            } catch (err) {
              console.error(err);
              alert("Payment verification failed.");
            }
          },
          prefill: {
            name: address.fullName,
            email: "test@example.com",
            contact: address.phone
          },
          theme: {
            color: "#2563eb"
          }
        };

        // If backend returned a mocked order because keys are missing, simulate success immediately
        if (mocked) {
          console.warn("MOCK PAYMENT: Simulating Razorpay success because keys are missing.");
          options.handler({
            razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
            razorpay_order_id: id,
            razorpay_signature: "mock_sig"
          });
          setLoading(false);
          return;
        }

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          alert("Payment failed: " + response.error.description);
        });
        
        paymentObject.open();
      }
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again or login.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    try {
      setCouponError("");
      const res = await api.post('/coupons/apply', { code: couponCode, cartTotal });
      if (res.data.success) {
        setAppliedCoupon(res.data.data);
        setDiscountAmount(res.data.data.discountAmount);
      }
    } catch (error: any) {
      setCouponError(error.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  };

  const deliveryFee = cartTotal > 500 || cartTotal === 0 ? 0 : 50;
  const total = cartTotal + deliveryFee - discountAmount;

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
              <div 
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Razorpay' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setPaymentMethod('Razorpay')}
              >
                <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center mr-4">
                  {paymentMethod === 'Razorpay' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <CreditCard className="w-6 h-6 mr-3 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Razorpay (Cards, UPI, NetBanking)</p>
                  <p className="text-sm text-muted-foreground">Pay securely via Razorpay</p>
                </div>
              </div>

              <div 
                className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onClick={() => setPaymentMethod('Cash on Delivery')}
              >
                <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center mr-4">
                  {paymentMethod === 'Cash on Delivery' && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <Banknote className="w-6 h-6 mr-3 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Pay when your order is delivered</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNextStep}>Continue to Review</Button>
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
                   
                   {/* Coupon Section */}
                   <div className="pt-4 border-t">
                     {!appliedCoupon ? (
                       <div className="flex gap-2">
                         <Input placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                         <Button variant="secondary" onClick={handleApplyCoupon}>Apply</Button>
                       </div>
                     ) : (
                       <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded">
                         <span>Coupon ({appliedCoupon.code})</span>
                         <div className="flex items-center gap-2">
                           <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                           <button onClick={() => {setAppliedCoupon(null); setDiscountAmount(0); setCouponCode("");}} className="text-red-500 text-xs">Remove</button>
                         </div>
                       </div>
                     )}
                     {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
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
              Thank you for shopping with Minikart. We&apos;ve received your order and will process it shortly.
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
