'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, Headset } from 'lucide-react';
import CustomerHeader from './CustomerHeader';
import MyParcels from './MyParcels';
import NewParcelForm from './NewParcelForm';
import TrackShipment from './TrackShipment';
import ParcelDetail from './ParcelDetail';
import CustomerSupport from './CustomerSupport';
import { Button } from '@/components/ui/button';

interface CustomerPortalProps {
  onBack: () => void;
}

type TabType = 'parcels' | 'new' | 'track' | 'support';
type SubView = 'main' | 'detail';

const tabs = [
  { key: 'parcels' as TabType, label: 'طرودي', icon: Package },
  { key: 'new' as TabType, label: 'طرد جديد', icon: Plus },
  { key: 'track' as TabType, label: 'تتبع', icon: Search },
  { key: 'support' as TabType, label: 'الدعم', icon: Headset },
];

export default function CustomerPortal({ onBack }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('parcels');
  const [subView, setSubView] = useState<SubView>('main');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [activeParcelsCount, setActiveParcelsCount] = useState(0);

  // Fetch active parcels count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/parcels?senderId=cmpjwmuhx0001kjlwxykih2nm&limit=50');
        const json = await res.json();
        if (json.success) {
          const active = json.data.filter(
            (p: { status: string }) =>
              p.status === 'PENDING' || p.status === 'PICKED_UP' || p.status === 'IN_TRANSIT'
          ).length;
          setActiveParcelsCount(active);
        }
      } catch (err) {
        // Silent fail
      }
    };
    fetchCount();
  }, []);

  const handleViewDetail = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    setSubView('detail');
  };

  const handleTrackFromParcels = (trackNum: string) => {
    setTrackingNumber(trackNum);
    setActiveTab('track');
  };

  const handleBackFromDetail = () => {
    setSubView('main');
    setSelectedParcelId(null);
  };

  const handleNewParcelSuccess = () => {
    setActiveTab('parcels');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <CustomerHeader
        onBack={onBack}
        activeParcelsCount={activeParcelsCount}
      />

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {subView === 'detail' && selectedParcelId ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <ParcelDetail
                parcelId={selectedParcelId}
                onBack={handleBackFromDetail}
                onTrack={handleTrackFromParcels}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'parcels' && (
                  <motion.div
                    key="parcels-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <MyParcels
                      onTrackParcel={handleTrackFromParcels}
                      onViewDetail={handleViewDetail}
                    />
                  </motion.div>
                )}

                {activeTab === 'new' && (
                  <motion.div
                    key="new-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <NewParcelForm onSuccess={handleNewParcelSuccess} />
                  </motion.div>
                )}

                {activeTab === 'track' && (
                  <motion.div
                    key="track-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <TrackShipment initialTrackingNumber={trackingNumber} />
                  </motion.div>
                )}

                {activeTab === 'support' && (
                  <motion.div
                    key="support-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <CustomerSupport />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
