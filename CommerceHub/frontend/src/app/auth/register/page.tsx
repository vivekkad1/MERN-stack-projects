"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md bg-card rounded-2xl border p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Join Minikart to start shopping and selling</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); alert("Registration coming soon!"); }}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              type="text" 
              required 
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="John Doe" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              required 
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
              placeholder="name@example.com" 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              required 
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters.</p>
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full">Sign Up</Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
