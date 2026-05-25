'use client';

import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  return <AdminDashboard onBack={() => router.push('/')} />;
}
