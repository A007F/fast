'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationsPanel from '@/components/shared/NotificationsPanel';

const tabTitles: Record<string, string> = {
  overview: 'لوحة التحكم',
  parcels: 'إدارة الطرود',
  captains: 'إدارة الكبائن',
  users: 'إدارة المستخدمين',
  tracking: 'التتبع المباشر',
  reports: 'التقارير',
  notifications: 'الإشعارات',
  support: 'الدعم الفني',
  payments: 'إدارة المدفوعات',
  promos: 'إدارة الكوبونات',
  reviews: 'إدارة التقييمات',
  settings: 'الإعدادات',
};

interface DashboardHeaderProps {
  activeTab: string;
  onBack: () => void;
}

export default function DashboardHeader({
  activeTab,
  onBack,
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            {tabTitles[activeTab] || 'لوحة التحكم'}
          </h1>
        </div>

        {/* Search - hidden on small screens */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Landing */}
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="hidden sm:flex items-center gap-2 text-xs"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للموقع
          </Button>

          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="sm:hidden"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <NotificationsPanel token={typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null} />

          {/* User Avatar */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                م
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-foreground">
              مدير النظام
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
