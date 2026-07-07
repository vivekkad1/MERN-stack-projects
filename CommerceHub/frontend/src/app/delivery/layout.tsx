import { ReactNode } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function DeliveryLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout role="delivery_partner">{children}</DashboardLayout>;
}
