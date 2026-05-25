'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  MapPin,
  ArrowLeftRight,
  DollarSign,
  Weight,
  Tag,
  CheckCircle2,
  Loader2,
  Clock,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CAPTAIN_ID = 'cmpjwmui00004kjlwle7k39ml';

interface ParcelData {
  id: string;
  trackingNumber: string;
  status: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  deliveryFee: number;
  category?: string | null;
  weight?: number | null;
  codAmount?: number | null;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  DOCUMENTS: 'وثائق',
  FOOD: 'طعام',
  ELECTRONICS: 'إلكترونيات',
  CLOTHES: 'ملابس',
  OTHER: 'أخرى',
};

const categoryIcons: Record<string, string> = {
  DOCUMENTS: '📄',
  FOOD: '🍕',
  ELECTRONICS: '📱',
  CLOTHES: '👕',
  OTHER: '📦',
};

const filters = [
  { label: 'الكل', value: 'ALL' },
  { label: 'وثائق', value: 'DOCUMENTS' },
  { label: 'طعام', value: 'FOOD' },
  { label: 'إلكترونيات', value: 'ELECTRONICS' },
];

function estimateDistance(addr1: string, addr2: string): string {
  const dist = Math.floor(Math.random() * 15) + 3;
  return `${dist} كم`;
}

function estimateTime(distance: string): string {
  const km = parseInt(distance.replace(' كم', '')) || 5;
  const mins = km * 4 + Math.floor(Math.random() * 10);
  return `${mins} دقيقة`;
}

export default function CaptainOrders() {
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAvailableOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/parcels?status=PENDING&limit=50');
      const json = await res.json();
      if (json.success) {
        // Only show parcels that don't have a captain assigned
        const available = json.data.filter(
          (p: ParcelData) => !p.status || p.status === 'PENDING'
        );
        setParcels(available);
        setLastRefresh(new Date());
      }
    } catch {
      toast.error('حدث خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableOrders();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchAvailableOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchAvailableOrders]);

  const acceptOrder = async (parcel: ParcelData) => {
    setAcceptingId(parcel.id);
    try {
      const res = await fetch(`/api/parcels/${parcel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          captainId: CAPTAIN_ID,
          status: 'PICKED_UP',
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم قبول الطلب بنجاح! 🎉');
        // Remove from available list
        setParcels((prev) => prev.filter((p) => p.id !== parcel.id));
      } else {
        toast.error(json.error || 'حدث خطأ في قبول الطلب');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredParcels =
    activeFilter === 'ALL'
      ? parcels
      : parcels.filter((p) => p.category === activeFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">الطلبات المتاحة</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-SA')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={fetchAvailableOrders}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === filter.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredParcels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-dashed border-2 border-border/50 mt-4">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Inbox className="h-9 w-9 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-muted-foreground">
                لا توجد طلبات متاحة حالياً
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2 max-w-xs mx-auto">
                يتم تحديث القائمة تلقائياً كل 10 ثوانٍ. انتظر ظهور طلبات جديدة!
              </p>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50">
                <RefreshCw className="h-3 w-3 animate-spin" />
                جارٍ التحديث التلقائي...
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredParcels.map((parcel, index) => {
              const dist = estimateDistance(parcel.senderAddress, parcel.receiverAddress);
              const time = estimateTime(dist);

              return (
                <motion.div
                  key={parcel.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border-border/60 hover:border-primary/30 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      {/* Category + Tracking */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {categoryIcons[parcel.category || 'OTHER']}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            {categoryLabels[parcel.category || 'OTHER']}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {parcel.trackingNumber}
                        </span>
                      </div>

                      {/* Route */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <div className="w-0.5 h-6 bg-border" />
                            <div className="w-0.5 h-6 bg-border" />
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <p className="text-[10px] text-blue-500 font-medium">من</p>
                              <p className="text-xs text-foreground line-clamp-1">
                                {parcel.senderAddress}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-red-500 font-medium">إلى</p>
                              <p className="text-xs text-foreground font-clamp-1">
                                {parcel.receiverAddress}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {parcel.receiverName} • {parcel.receiverPhone}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info row */}
                      <div className="flex items-center gap-3 mb-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ArrowLeftRight className="h-3 w-3" />
                          {dist}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {time}
                        </span>
                        {parcel.weight && (
                          <span className="flex items-center gap-1">
                            <Weight className="h-3 w-3" />
                            {parcel.weight} كجم
                          </span>
                        )}
                      </div>

                      {/* COD if any */}
                      {parcel.codAmount && parcel.codAmount > 0 && (
                        <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-amber-50 rounded-lg">
                          <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-xs text-amber-700 font-medium">
                            الدفع عند الاستلام: {parcel.codAmount} ر.س
                          </span>
                        </div>
                      )}

                      {/* Fee + Accept */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div>
                          <p className="text-[10px] text-muted-foreground">رسوم التوصيل</p>
                          <p className="text-lg font-bold text-primary">
                            {parcel.deliveryFee}{' '}
                            <span className="text-xs font-normal text-muted-foreground">
                              ر.س
                            </span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={acceptingId === parcel.id}
                          onClick={() => acceptOrder(parcel)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5 h-9 text-sm font-semibold"
                        >
                          {acceptingId === parcel.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 ml-1" />
                              قبول الطلب
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
