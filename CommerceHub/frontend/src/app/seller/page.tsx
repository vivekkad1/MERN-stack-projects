"use client";

import { Store, TrendingUp, ShieldCheck, Banknote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SellPage() {
  return (
    <div className="flex flex-col gap-16 pb-16 min-h-[calc(100vh-144px)]">
      {/* Hero Section */}
      <section className="relative w-full min-h-[calc(100vh-144px)] flex items-center justify-center overflow-hidden bg-primary/5">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Grow Your Business <br className="hidden md:block" />
              <span className="text-primary">
                With Minikart
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] mx-auto md:mx-0">
              Reach millions of customers across India. Easy onboarding, secure payments, and lowest commission rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" className="gap-2" onClick={() => alert("Registration coming soon!")}>
                Start Selling <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center md:justify-end">
            <div className="relative w-full max-w-[400px] aspect-square rounded-full bg-primary/10 flex items-center justify-center border-8 border-background shadow-xl">
               <Store className="w-32 h-32 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Why Sell on Minikart?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
            <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Massive Reach</h3>
            <p className="text-muted-foreground">Access millions of daily active shoppers actively looking for products like yours.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
            <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
              <Banknote className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fast Payments</h3>
            <p className="text-muted-foreground">Receive your funds directly into your bank account securely and on time.</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border shadow-sm">
            <div className="h-16 w-16 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Seller Protection</h3>
            <p className="text-muted-foreground">We protect you against fraudulent orders and handle customer support.</p>
          </div>
        </div>
      </section>
      
      {/* Registration Form placeholder */}
      <section className="container px-4 md:px-6">
         <div className="max-w-2xl mx-auto bg-card border rounded-3xl p-8 md:p-12 shadow-lg">
           <div className="text-center mb-8">
             <h2 className="text-2xl font-bold">Ready to get started?</h2>
             <p className="text-muted-foreground mt-2">Leave your email and our onboarding team will contact you within 24 hours.</p>
           </div>
           
           <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks! We will contact you soon."); }}>
             <div className="flex flex-col gap-2">
               <label className="text-sm font-medium">Business Name</label>
               <input type="text" required className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="Your Business Pvt. Ltd." />
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-sm font-medium">Email Address</label>
               <input type="email" required className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="hello@yourbusiness.com" />
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-sm font-medium">Phone Number</label>
               <input type="tel" required className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" placeholder="+91" />
             </div>
             <Button size="lg" className="mt-4" type="submit">Submit Request</Button>
           </form>
         </div>
      </section>
    </div>
  );
}
