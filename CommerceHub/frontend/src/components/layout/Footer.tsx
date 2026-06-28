import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Minikart
            </h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for the best products across the globe. Built for a seamless shopping experience.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categories/electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link href="/categories/fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link href="/categories/home" className="hover:text-primary transition-colors">Home & Garden</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">Daily Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/track" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Business</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/seller" className="hover:text-primary transition-colors">Sell on Minikart</Link></li>
              <li><Link href="/affiliate" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link href="/advertise" className="hover:text-primary transition-colors">Advertise with Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Minikart. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
