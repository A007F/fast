'use client';

import CaptainDashboard from '@/components/captain/CaptainDashboard';
import { useRouter } from 'next/navigation';

export default function CaptainPage() {
  const router = useRouter();

  return <CaptainDashboard onBack={() => router.push('/')} />;
}
