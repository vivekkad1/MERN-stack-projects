import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function SellerDashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="seller">{children}</DashboardLayout>;
}
