"use client";

import { useState, useEffect, Suspense } from "react";
import { User, Package, Settings, CreditCard, LogOut, Heart, Moon, Sun, Monitor, Loader2, Calendar, MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

function ProfileContent() {
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "account");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Vivek Sharma",
    email: "vivek@example.com",
    phone: "+91 98765 43210"
  });
  const [tempProfileData, setTempProfileData] = useState({ ...profileData });
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/orders/myorders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-6 max-w-lg">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              {isEditingProfile ? (
                <input type="text" value={tempProfileData.name} onChange={(e) => setTempProfileData({...tempProfileData, name: e.target.value})} className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" />
              ) : (
                <div className="h-12 px-4 rounded-md border bg-background flex items-center">
                  {profileData.name}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              {isEditingProfile ? (
                <input type="email" value={tempProfileData.email} onChange={(e) => setTempProfileData({...tempProfileData, email: e.target.value})} className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" />
              ) : (
                <div className="h-12 px-4 rounded-md border bg-background flex items-center">
                  {profileData.email}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              {isEditingProfile ? (
                <input type="tel" value={tempProfileData.phone} onChange={(e) => setTempProfileData({...tempProfileData, phone: e.target.value})} className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" />
              ) : (
                <div className="h-12 px-4 rounded-md border bg-background flex items-center">
                  {profileData.phone}
                </div>
              )}
            </div>
            
            <div className="pt-6 flex gap-3">
              {isEditingProfile ? (
                <>
                  <Button size="lg" onClick={() => { 
                    setProfileData(tempProfileData); 
                    setIsEditingProfile(false); 
                  }}>
                    Save Changes
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => {
                    setTempProfileData(profileData);
                    setIsEditingProfile(false);
                  }}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
                <Package className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">When you place orders, they will appear here so you can track them.</p>
                <Button onClick={() => window.location.href = "/"}>Start Shopping</Button>
              </div>
            ) : (
              orders.map((order, index) => (
                <div key={order._id} className="border rounded-xl p-6 bg-card flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h4 className="font-semibold text-base md:text-lg">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h4>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                      </div>
                      <p className="font-bold text-lg mt-2 text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-center">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                  </div>
                  
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                     {order.orderItems.map((item: any) => (
                       <div key={item._id} className="flex gap-3 items-center border rounded-lg p-2 bg-muted/20">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-md flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                             {item.product?.images?.[0] ? (
                               <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                             ) : 'IMG'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium truncate">{item.product?.name || 'Product'}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case "wishlist":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
            <Heart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Save items you love to your wishlist to easily find them later.</p>
            <Button onClick={() => window.location.href = "/"}>Explore Products</Button>
          </div>
        );
      case "payment":
        return (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
            <CreditCard className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No payment methods</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">Add a payment method for faster and smoother checkout.</p>
            <Button onClick={() => alert("Add Payment Method coming soon!")}>Add Payment Method</Button>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-8 max-w-2xl">
            {/* Appearance Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Appearance</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose how CommerceHub looks to you.</p>
              
              {mounted ? (
                <div className="flex items-center gap-4">
                  <Button 
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    onClick={() => setTheme('light')}
                    className="flex-1 h-12"
                  >
                    <Sun className="h-5 w-5 mr-2" /> Light
                  </Button>
                  <Button 
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    onClick={() => setTheme('dark')}
                    className="flex-1 h-12"
                  >
                    <Moon className="h-5 w-5 mr-2" /> Dark
                  </Button>
                  <Button 
                    variant={theme === 'system' ? 'default' : 'outline'} 
                    onClick={() => setTheme('system')}
                    className="flex-1 h-12"
                  >
                    <Monitor className="h-5 w-5 mr-2" /> System
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-12 bg-muted rounded-md animate-pulse"></div>
                  <div className="flex-1 h-12 bg-muted rounded-md animate-pulse"></div>
                  <div className="flex-1 h-12 bg-muted rounded-md animate-pulse"></div>
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Change Password</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">New Password</label>
                  <input type="password" placeholder="Enter new password" className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                </div>
              </div>
              <Button onClick={() => alert("Password update functionality coming soon!")}>Update Password</Button>
            </div>

            <hr className="border-border" />

            {/* Notifications Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Notifications</h3>
              
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-base">Order Updates</h4>
                  <p className="text-sm text-muted-foreground">Receive emails about your order status and shipping.</p>
                </div>
                <div className="flex items-center h-5">
                  <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary rounded cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-base">Promotional Emails</h4>
                  <p className="text-sm text-muted-foreground">Receive emails about new products, sales, and more.</p>
                </div>
                <div className="flex items-center h-5">
                  <input type="checkbox" className="h-5 w-5 accent-primary rounded cursor-pointer" />
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="space-y-0.5">
                  <h4 className="font-medium text-base">SMS Alerts</h4>
                  <p className="text-sm text-muted-foreground">Receive text messages for delivery updates.</p>
                </div>
                <div className="flex items-center h-5">
                  <input type="checkbox" className="h-5 w-5 accent-primary rounded cursor-pointer" />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Danger Zone */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-destructive">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
              <Button variant="destructive" onClick={() => alert("Account deletion functionality coming soon!")}>
                Delete Account
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case "account": return "Account Details";
      case "orders": return "My Orders";
      case "wishlist": return "Wishlist";
      case "payment": return "Payment Methods";
      case "settings": return "Settings";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 min-h-screen">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">My Profile</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <Button 
            variant={activeTab === "account" ? "secondary" : "ghost"} 
            className="justify-start gap-3 h-12 text-base"
            onClick={() => setActiveTab("account")}
          >
            <User className="h-5 w-5" /> Account Details
          </Button>
          <Button 
            variant={activeTab === "orders" ? "secondary" : "ghost"} 
            className="justify-start gap-3 h-12 text-base"
            onClick={() => setActiveTab("orders")}
          >
            <Package className="h-5 w-5" /> My Orders
          </Button>
          <Button 
            variant={activeTab === "wishlist" ? "secondary" : "ghost"} 
            className="justify-start gap-3 h-12 text-base"
            onClick={() => setActiveTab("wishlist")}
          >
            <Heart className="h-5 w-5" /> Wishlist
          </Button>
          <Button 
            variant={activeTab === "payment" ? "secondary" : "ghost"} 
            className="justify-start gap-3 h-12 text-base"
            onClick={() => setActiveTab("payment")}
          >
            <CreditCard className="h-5 w-5" /> Payment Methods
          </Button>
          <Button 
            variant={activeTab === "settings" ? "secondary" : "ghost"} 
            className="justify-start gap-3 h-12 text-base"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="h-5 w-5" /> Settings
          </Button>
          <div className="mt-8 pt-4 border-t">
            <Button variant="ghost" className="justify-start gap-3 h-12 text-base text-destructive hover:text-destructive hover:bg-destructive/10 w-full" onClick={() => alert("Sign Out coming soon!")}>
              <LogOut className="h-5 w-5" /> Sign Out
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-card rounded-2xl border p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProfileContent />
    </Suspense>
  )
}
