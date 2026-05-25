'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, Truck, DollarSign, Wallet } from 'lucide-react';

import CaptainHeader from './CaptainHeader';
import CaptainHome from './CaptainHome';
import CaptainOrders from './CaptainOrders';
import CaptainDeliveries from './CaptainDeliveries';
import CaptainEarnings from './CaptainEarnings';
import CaptainWallet from './CaptainWallet';

const tabs = [
  { id: 'home', label: 'الرئيسية', icon: Home },
  { id: 'orders', label: 'الطلبات', icon: ShoppingBag },
  { id: 'deliveries', label: 'التوصيلات', icon: Truck },
  { id: 'earnings', label: 'الإيرادات', icon: DollarSign },
  { id: 'wallet', label: 'المحفظة', icon: Wallet },
] as const;

type TabId = (typeof tabs)[number]['id'];

interface CaptainDashboardProps {
  onBack: () => void;
}

export default function CaptainDashboard({ onBack }: CaptainDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [isOnline, setIsOnline] = useState(false);

  const captainInfo = {
    name: 'سالم عبدالله القحطاني',
    vehicleBrand: 'هوندا CB125',
    licensePlate: 'أ ب ج 1234',
    rating: 4.8,
    totalDeliveries: 156,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <CaptainHome />;
      case 'orders':
        return <CaptainOrders />;
      case 'deliveries':
        return <CaptainDeliveries />;
      case 'earnings':
        return <CaptainEarnings />;
      case 'wallet':
        return <CaptainWallet />;
      default:
        return <CaptainHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <CaptainHeader
        captainName={captainInfo.name}
        vehicleBrand={captainInfo.vehicleBrand}
        licensePlate={captainInfo.licensePlate}
        rating={captainInfo.rating}
        totalDeliveries={captainInfo.totalDeliveries}
        isOnline={isOnline}
        onToggleOnline={setIsOnline}
        onBack={onBack}
      />

      {/* Content area */}
      <main className="flex-1 px-4 sm:px-6 pt-4 pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="fixed bottom-0 right-0 left-0 z-40 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center justify-around h-16">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="captainTabIndicator"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <tab.icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {/* Orders badge indicator */}
                  {tab.id === 'orders' && (
                    <div className="absolute top-1 right-1/4 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* Safe area for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </motion.nav>
    </div>
  );
}
