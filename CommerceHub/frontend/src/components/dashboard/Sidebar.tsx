import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, ShoppingCart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: 'admin' | 'seller' | 'delivery_partner';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/inventory', label: 'Inventory', icon: Package },
    { href: '/admin/support', label: 'Support', icon: Users },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: Settings },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const sellerLinks = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/seller/dashboard/products', label: 'My Products', icon: Package },
    { href: '/seller/dashboard/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/seller/dashboard/inventory', label: 'Inventory', icon: Package },
  ];

  const deliveryLinks = [
    { href: '/delivery/dashboard', label: 'My Deliveries', icon: Package },
  ];

  const links = role === 'admin' ? adminLinks : role === 'seller' ? sellerLinks : deliveryLinks;

  return (
    <aside className="w-64 bg-card border-r min-h-[calc(100vh-64px)] hidden md:block">
      <div className="p-4 py-6 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
