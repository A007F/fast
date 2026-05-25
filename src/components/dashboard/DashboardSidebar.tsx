'use client';

import { motion } from 'framer-motion';
import {
  Truck,
  LayoutDashboard,
  Package,
  Users,
  UserCheck,
  MapPin,
  BarChart3,
  Bell,
  Headset,
  Settings,
  CreditCard,
  Tag,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'overview', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'parcels', label: 'إدارة الطرود', icon: Package },
  { id: 'captains', label: 'إدارة الكبائن', icon: UserCheck },
  { id: 'users', label: 'المستخدمين', icon: Users },
  { id: 'payments', label: 'المدفوعات', icon: CreditCard },
  { id: 'tracking', label: 'التتبع المباشر', icon: MapPin },
  { id: 'reports', label: 'التقارير', icon: BarChart3 },
  { id: 'notifications', label: 'الإشعارات', icon: Bell },
  { id: 'support', label: 'الدعم الفني', icon: Headset },
  { id: 'promos', label: 'الكوبونات', icon: Tag },
  { id: 'reviews', label: 'التقييمات', icon: Star },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed right-0 top-0 bottom-0 w-64 bg-foreground text-background z-40">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-background/10">
            <div className="bg-primary rounded-xl p-2.5">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-background">سريع</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'text-background/60 hover:text-background hover:bg-background/10'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-background/10">
            <p className="text-xs text-background/40">
              لوحة الإدارة v1.0
            </p>
          </div>
        </motion.div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 right-0 left-0 bg-foreground text-background z-50 border-t border-background/10 safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[56px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-background/50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
