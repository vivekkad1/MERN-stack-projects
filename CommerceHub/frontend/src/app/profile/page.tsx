"use client";

import { User, Package, Settings, CreditCard, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">My Profile</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <Button variant="secondary" className="justify-start gap-3 h-12 text-base">
            <User className="h-5 w-5" /> Account Details
          </Button>
          <Button variant="ghost" className="justify-start gap-3 h-12 text-base">
            <Package className="h-5 w-5" /> My Orders
          </Button>
          <Button variant="ghost" className="justify-start gap-3 h-12 text-base">
            <Heart className="h-5 w-5" /> Wishlist
          </Button>
          <Button variant="ghost" className="justify-start gap-3 h-12 text-base">
            <CreditCard className="h-5 w-5" /> Payment Methods
          </Button>
          <Button variant="ghost" className="justify-start gap-3 h-12 text-base">
            <Settings className="h-5 w-5" /> Settings
          </Button>
          <div className="mt-8 pt-4 border-t">
            <Button variant="ghost" className="justify-start gap-3 h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10 w-full">
              <LogOut className="h-5 w-5" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-card rounded-2xl border p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Account Details</h2>
          
          <div className="space-y-6 max-w-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <div className="h-12 px-4 rounded-md border bg-background flex items-center">
                Vivek Sharma
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="h-12 px-4 rounded-md border bg-background flex items-center">
                vivek@example.com
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <div className="h-12 px-4 rounded-md border bg-background flex items-center">
                +91 98765 43210
              </div>
            </div>
            
            <div className="pt-6">
              <Button size="lg" onClick={() => alert("Edit Profile coming soon!")}>
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
