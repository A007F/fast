'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Truck,
  Phone,
  Star,
  Clock,
  Package,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  PICKED_UP: { label: 'تم الاستلام', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  IN_TRANSIT: { label: 'قيد التوصيل', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  DELIVERED: { label: 'تم التسليم', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  CANCELLED: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  RETURNED: { label: 'تم الإرجاع', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

const progressSteps = [
  { key: 'PENDING', label: 'تم الإنشاء' },
  { key: 'PICKED_UP', label: 'تم الاستلام' },
  { key: 'IN_TRANSIT', label: 'قيد التوصيل' },
  { key: 'DELIVERED', label: 'تم التسليم' },
];

const statusOrder = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

interface TrackData {
  parcel: {
    id: string;
    trackingNumber: string;
    status: string;
    senderAddress: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    weight: number | null;
    size: string | null;
    description: string | null;
    category: string | null;
    codAmount: number | null;
    deliveryFee: number;
    paymentMethod: string;
    createdAt: string;
    pickedUpAt: string | null;
    deliveredAt: string | null;
    estimatedDelivery: string | null;
  };
  timeline: {
    id: string;
    status: string;
    description: string;
    location: string | null;
    createdAt: string;
  }[];
  captain: {
    id: string;
    name: string;
    phone: string;
    avatar: string | null;
    vehicleType: string;
    vehicleBrand: string | null;
    licensePlate: string | null;
    rating: number;
    totalDeliveries: number;
  } | null;
}

interface TrackShipmentProps {
  initialTrackingNumber?: string;
  onBack?: () => void;
}

export default function TrackShipment({ initialTrackingNumber, onBack }: TrackShipmentProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      setError('يرجى إدخال رقم التتبع');
      return;
    }
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/parcels/track/${encodeURIComponent(trackingNumber.trim())}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'لم يتم العثور على الطرد');
        setData(null);
      }
    } catch (err) {
      setError('حدث خطأ أثناء البحث');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrackingNumber) {
      handleSearch();
    }
  }, []);

  const getProgressIndex = (status: string) => {
    if (status === 'CANCELLED' || status === 'RETURNED') return -1;
    return statusOrder.indexOf(status);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const vehicleTypeLabels: Record<string, string> = {
    MOTORCYCLE: 'دراجة نارية',
    CAR: 'سيارة',
    VAN: 'فان',
    TRUCK: 'شاحنة',
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="أدخل رقم التتبع... مثال: SR-12345678"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10 pl-4 h-12 rounded-xl border-border/50 focus:border-primary text-base"
              dir="ltr"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 h-12 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </motion.div>
        )}

        {error && searched && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">لم يتم العثور على الطرد</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">تأكد من صحة رقم التتبع وحاول مرة أخرى</p>
          </motion.div>
        )}

        {data && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Status Card */}
            <Card className="border-border/50 overflow-hidden">
              <div className={`h-2 ${
                data.parcel.status === 'DELIVERED'
                  ? 'bg-emerald-500'
                  : data.parcel.status === 'CANCELLED'
                    ? 'bg-red-500'
                    : 'bg-primary'
              }`} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">رقم التتبع</p>
                    <p className="font-mono text-lg font-bold text-foreground tracking-wide" dir="ltr">
                      {data.parcel.trackingNumber}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium border ${statusConfig[data.parcel.status]?.bg} ${statusConfig[data.parcel.status]?.color}`}
                  >
                    {statusConfig[data.parcel.status]?.label}
                  </Badge>
                </div>

                {/* Progress Bar */}
                {data.parcel.status !== 'CANCELLED' && data.parcel.status !== 'RETURNED' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between relative">
                      {/* Progress line background */}
                      <div className="absolute top-4 right-4 left-4 h-0.5 bg-muted rounded-full" />
                      {/* Progress line filled */}
                      <div
                        className="absolute top-4 right-4 h-0.5 bg-primary rounded-full transition-all duration-500"
                        style={{
                          width: `${(getProgressIndex(data.parcel.status) / (progressSteps.length - 1)) * 100}%`,
                        }}
                      />
                      {/* Step dots */}
                      {progressSteps.map((step, idx) => {
                        const currentIndex = getProgressIndex(data.parcel.status);
                        const isCompleted = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                  : 'bg-background border-2 border-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                              isCompleted ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Route */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-0.5 h-8 bg-border" />
                    <Truck className="h-4 w-4 text-primary" />
                    <div className="w-0.5 h-8 bg-border" />
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground">من</p>
                      <p className="text-sm font-medium text-foreground">{data.parcel.senderAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">إلى</p>
                      <p className="text-sm font-medium text-foreground">{data.parcel.receiverAddress}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Captain Info Card */}
            {data.captain && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      الكابتن المكلف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                            {data.captain.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground">{data.captain.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium text-foreground">{data.captain.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {vehicleTypeLabels[data.captain.vehicleType] || data.captain.vehicleType}
                            </span>
                            {data.captain.vehicleBrand && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{data.captain.vehicleBrand}</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {data.captain.totalDeliveries} توصيل مكتمل
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          if (data.captain) {
                            window.open(`tel:${data.captain.phone}`, '_self');
                          }
                        }}
                      >
                        <Phone className="h-4 w-4 ml-1" />
                        <span className="hidden sm:inline">اتصل بالكابتن</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    سجل الأحداث
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-border" />

                    <div className="space-y-4">
                      {data.timeline.map((event, idx) => (
                        <div key={event.id} className="flex gap-3 relative">
                          {/* Timeline dot */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            idx === data.timeline.length - 1
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border-2 border-primary/30'
                          }`}>
                            {idx === data.timeline.length - 1 ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-2.5 w-2.5" />
                            )}
                          </div>

                          {/* Event content */}
                          <div className="flex-1 pb-1">
                            <p className="text-sm font-medium text-foreground">{event.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(event.createdAt)}
                              </span>
                              {event.location && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <div className="h-48 bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-10 w-10" />
                  <span className="text-sm font-medium">خريطة المسار</span>
                  <span className="text-xs">(قريباً)</span>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
