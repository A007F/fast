'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  PackageOpen,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const CUSTOMER_ID = 'cmpjwmuhx0001kjlwxykih2nm';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  PICKED_UP: { label: 'تم الاستلام', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  IN_TRANSIT: { label: 'قيد التوصيل', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  DELIVERED: { label: 'تم التسليم', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  CANCELLED: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  RETURNED: { label: 'تم الإرجاع', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

const sizeConfig: Record<string, { label: string }> = {
  SMALL: { label: 'صغير' },
  MEDIUM: { label: 'متوسط' },
  LARGE: { label: 'كبير' },
};

const categoryConfig: Record<string, { label: string }> = {
  DOCUMENTS: { label: 'وثائق' },
  FOOD: { label: 'طعام' },
  ELECTRONICS: { label: 'إلكترونيات' },
  CLOTHES: { label: 'ملابس' },
  OTHER: { label: 'أخرى' },
};

interface Parcel {
  id: string;
  trackingNumber: string;
  senderAddress: string;
  receiverAddress: string;
  receiverName: string;
  status: string;
  createdAt: string;
  deliveryFee: number;
  codAmount: number | null;
  size: string | null;
  category: string | null;
  weight: number | null;
  description: string | null;
  paymentMethod: string;
}

interface MyParcelsProps {
  onTrackParcel?: (trackingNumber: string) => void;
  onViewDetail?: (parcelId: string) => void;
}

export default function MyParcels({ onTrackParcel, onViewDetail }: MyParcelsProps) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parcels?senderId=${CUSTOMER_ID}&limit=50`);
      const json = await res.json();
      if (json.success) {
        setParcels(json.data);
      }
    } catch (err) {
      console.error('خطأ في جلب الطرود:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const statusTabs = [
    { key: 'ALL', label: 'الكل' },
    { key: 'PENDING', label: 'قيد الانتظار' },
    { key: 'PICKED_UP', label: 'تم الاستلام' },
    { key: 'IN_TRANSIT', label: 'قيد التوصيل' },
    { key: 'DELIVERED', label: 'تم التسليم' },
    { key: 'CANCELLED', label: 'ملغي' },
  ];

  const filteredParcels = parcels.filter((p) => {
    const matchStatus = activeTab === 'ALL' || p.status === activeTab;
    const matchSearch = !searchQuery || p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) || p.receiverName.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const visibleParcels = filteredParcels.slice(0, showCount);
  const hasMore = filteredParcels.length > showCount;

  const activeParcelsCount = parcels.filter(
    (p) => p.status === 'PENDING' || p.status === 'PICKED_UP' || p.status === 'IN_TRANSIT'
  ).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Search skeleton */}
        <Skeleton className="h-12 w-full rounded-xl" />
        {/* Status tabs skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
          ))}
        </div>
        {/* Card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active parcels summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredParcels.length} طرد
          {activeParcelsCount > 0 && (
            <Badge variant="secondary" className="mr-2 bg-primary/10 text-primary border-0">
              {activeParcelsCount} نشط
            </Badge>
          )}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث برقم التتبع أو اسم المستلم..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 pl-4 h-11 rounded-xl border-border/50 focus:border-primary"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusTabs.map((tab) => {
          const count = tab.key === 'ALL'
            ? parcels.length
            : parcels.filter((p) => p.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowCount(3); }}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
              <span className="mr-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Parcels List */}
      {visibleParcels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <PackageOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">لا توجد طرود</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? 'لم يتم العثور على نتائج تطابق البحث'
              : 'لم تقم بإرسال أي طرود بعد'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleParcels.map((parcel, index) => {
              const status = statusConfig[parcel.status] || statusConfig.PENDING;
              const isExpanded = expandedCard === parcel.id;

              return (
                <motion.div
                  key={parcel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Main Card Content */}
                    <CardContent className="p-4">
                      {/* Top Row: Tracking + Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 rounded-lg p-1.5">
                            <Truck className="h-4 w-4 text-primary" />
                          </div>
                          <span
                            className="font-mono text-sm font-bold text-foreground tracking-wide"
                            dir="ltr"
                          >
                            {parcel.trackingNumber}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium border ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </Badge>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <div className="flex-1 text-right">
                          <p className="text-muted-foreground text-xs mb-0.5">من</p>
                          <p className="text-foreground font-medium truncate">
                            {parcel.senderAddress.length > 25
                              ? parcel.senderAddress.slice(0, 25) + '...'
                              : parcel.senderAddress}
                          </p>
                        </div>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Truck className="h-3.5 w-3.5 text-primary rotate-180" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-muted-foreground text-xs mb-0.5">إلى</p>
                          <p className="text-foreground font-medium truncate">
                            {parcel.receiverAddress.length > 25
                              ? parcel.receiverAddress.slice(0, 25) + '...'
                              : parcel.receiverAddress}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Row: Date + Cost + Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(parcel.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary">
                            {parcel.deliveryFee} ر.س
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedCard(isExpanded ? null : parcel.id)}
                            aria-label="عرض المزيد"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0 border-t border-border/50">
                            <div className="pt-3 space-y-2.5">
                              {/* Receiver */}
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">المستلم</span>
                                <span className="font-medium text-foreground">{parcel.receiverName}</span>
                              </div>

                              {/* Size */}
                              {parcel.size && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">الحجم</span>
                                  <span className="font-medium text-foreground">
                                    {sizeConfig[parcel.size]?.label || parcel.size}
                                  </span>
                                </div>
                              )}

                              {/* Category */}
                              {parcel.category && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">الفئة</span>
                                  <span className="font-medium text-foreground">
                                    {categoryConfig[parcel.category]?.label || parcel.category}
                                  </span>
                                </div>
                              )}

                              {/* Weight */}
                              {parcel.weight && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">الوزن</span>
                                  <span className="font-medium text-foreground">{parcel.weight} كجم</span>
                                </div>
                              )}

                              {/* COD */}
                              {parcel.codAmount && parcel.codAmount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">الدفع عند الاستلام</span>
                                  <span className="font-medium text-foreground">{parcel.codAmount} ر.س</span>
                                </div>
                              )}

                              {/* Description */}
                              {parcel.description && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">الوصف: </span>
                                  <span className="text-foreground">{parcel.description}</span>
                                </div>
                              )}

                              {/* Full Addresses */}
                              <div className="text-sm space-y-1 pt-1">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-muted-foreground text-xs">عنوان المرسل</p>
                                    <p className="text-foreground">{parcel.senderAddress}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                                  <div>
                                    <p className="text-muted-foreground text-xs">عنوان المستلم</p>
                                    <p className="text-foreground">{parcel.receiverAddress}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                  onClick={() => onTrackParcel?.(parcel.trackingNumber)}
                                >
                                  <MapPin className="h-3.5 w-3.5 ml-1" />
                                  تتبع
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
                                  onClick={() => onViewDetail?.(parcel.id)}
                                >
                                  التفاصيل
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setShowCount((prev) => prev + 3)}
            className="border-primary/30 text-primary hover:bg-primary/5 rounded-xl px-8"
          >
            عرض المزيد
            <ChevronDown className="h-4 w-4 mr-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { type MyParcelsProps };
