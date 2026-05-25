'use client';

import CustomerPortal from '@/components/customer/CustomerPortal';
import { useRouter } from 'next/navigation';

export default function CustomerPage() {
  const router = useRouter();

  return <CustomerPortal onBack={() => router.push('/')} />;
}
