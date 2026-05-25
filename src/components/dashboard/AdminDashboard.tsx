'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import StatsOverview from './StatsOverview';
import ParcelsTable from './ParcelsTable';
import CaptainsTable from './CaptainsTable';
import LiveTracking from './LiveTracking';
import ReportsAnalytics from './ReportsAnalytics';
import DashboardSettings from './DashboardSettings';
import AdminNotifications from './AdminNotifications';
import UserManagement from './UserManagement';
import AdminSupport from './AdminSupport';
import AdminPayments from './AdminPayments';
import AdminPromoCodes from './AdminPromoCodes';
import AdminReviews from './AdminReviews';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <StatsOverview />;
      case 'parcels':
        return <ParcelsTable />;
      case 'captains':
        return <CaptainsTable />;
      case 'tracking':
        return <LiveTracking />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <ReportsAnalytics onBack={onBack} />;
      case 'notifications':
        return <AdminNotifications />;
      case 'support':
        return <AdminSupport />;
      case 'payments':
        return <AdminPayments />;
      case 'promos':
        return <AdminPromoCodes />;
      case 'reviews':
        return <AdminReviews />;
      case 'settings':
        return <DashboardSettings />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Header */}
        <DashboardHeader activeTab={activeTab} onBack={onBack} />

        {/* Page Content */}
        <main className="p-4 sm:p-6 pb-24 lg:pb-6">
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
      </div>
    </div>
  );
}
