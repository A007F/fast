'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, MapPin, CheckCircle2, Clock, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface TimelineEntry {
  id: string;
  status: string;
  description: string;
  location: string | null;
  createdAt: string;
}

interface TrackResult {
  parcel: {
    trackingNumber: string;
    status: string;
    senderAddress: string;
    receiverAddress: string;
    receiverName: string;
    receiverPhone: string;
    deliveryFee: number;
    codAmount: number | null;
    description: string | null;
    createdAt: string;
    pickedUpAt: string | null;
    deliveredAt: string | null;
  };
  timeline: TimelineEntry[];
  captain: {
    user: { name: string; phone: string };
    vehicleType: string;
    rating: number;
  } | null;
}

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: {
    label: 'قيد الانتظار',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Clock className="h-3.5 w-3.5 ml-1" />,
  },
  PICKED_UP: {
    label: 'تم الاستلام',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Package className="h-3.5 w-3.5 ml-1" />,
  },
  IN_TRANSIT: {
    label: 'في الطريق',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Truck className="h-3.5 w-3.5 ml-1" />,
  },
  DELIVERED: {
    label: 'تم التسليم',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: <CheckCircle2 className="h-3.5 w-3.5 ml-1" />,
  },
  CANCELLED: {
    label: 'ملغي',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <XCircle className="h-3.5 w-3.5 ml-1" />,
  },
  RETURNED: {
    label: 'مرتجع',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: <AlertCircle className="h-3.5 w-3.5 ml-1" />,
  },
};

const statusSteps = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

function getStepIcon(step: string) {
  switch (step) {
    case 'PENDING': return <Package className="h-4 w-4" />;
    case 'PICKED_UP': return <CheckCircle2 className="h-4 w-4" />;
    case 'IN_TRANSIT': return <Truck className="h-4 w-4" />;
    case 'DELIVERED': return <MapPin className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackParcel() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/parcels/track/${trackingNumber.trim()}`);
      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || 'لم يتم العثور على الشحنة');
      }
    } catch {
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTrack();
  };

  const getStatusStepIndex = (status: string) => {
    if (status === 'CANCELLED' || status === 'RETURNED') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <section id="track" className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-primary">تتبع</span> شحنتك
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            أدخل رقم التتبع لمعرفة حالة شحنتك في الوقت الفعلي
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-xl mx-auto mb-10"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="أدخل رقم التتبع (مثال: SR-12345678)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10 text-right h-12 rounded-xl border-border/50 focus:border-primary/50"
                dir="rtl"
              />
            </div>
            <Button
              onClick={handleTrack}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-xl font-semibold"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'تتبع'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            جرب: SR-89012345 أو SR-56789012 أو SR-23456789
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto mb-8"
            >
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-primary/20 shadow-lg shadow-primary/5">
                <CardContent className="p-6 sm:p-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">رقم التتبع</p>
                      <p className="text-lg font-bold font-mono tracking-wide">{result.parcel.trackingNumber}</p>
                    </div>
                    {(() => {
                      const statusInfo = statusMap[result.parcel.status] || statusMap.PENDING;
                      return (
                        <Badge className={`${statusInfo.color} text-sm px-3 py-1`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </Badge>
                      );
                    })()}
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-3 mb-6 p-4 bg-muted/50 rounded-xl">
                    <div className="text-right flex-1">
                      <p className="text-xs text-muted-foreground">من</p>
                      <p className="font-semibold text-sm">{result.parcel.senderAddress}</p>
                    </div>
                    <div className="flex-1 border-t border-dashed border-primary/30 relative">
                      <Truck className="absolute -top-3 right-1/2 translate-x-1/2 h-5 w-5 text-primary bg-background px-1" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-xs text-muted-foreground">إلى</p>
                      <p className="font-semibold text-sm">{result.parcel.receiverAddress}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">المستلم</p>
                      <p className="font-medium text-sm mt-1">{result.parcel.receiverName}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">رسوم التوصيل</p>
                      <p className="font-medium text-sm mt-1">{result.parcel.deliveryFee} ر.س</p>
                    </div>
                    {result.parcel.codAmount ? (
                      <div className="bg-muted/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">الدفع عند الاستلام</p>
                        <p className="font-medium text-sm mt-1">{result.parcel.codAmount} ر.س</p>
                      </div>
                    ) : (
                      <div className="bg-muted/30 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground">الوصف</p>
                        <p className="font-medium text-sm mt-1 truncate">{result.parcel.description || '---'}</p>
                      </div>
                    )}
                    {result.captain && (
                      <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
                        <p className="text-xs text-primary/70">الكابتن</p>
                        <p className="font-medium text-sm mt-1">{result.captain.user.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {result.timeline.length > 0 && (
                    <div className="space-y-0">
                      <p className="font-semibold text-sm mb-4">سجل الأحداث</p>
                      {result.timeline.map((item, index) => (
                        <div key={item.id} className="flex gap-4">
                          {/* Line & dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">
                              {getStepIcon(item.status)}
                            </div>
                            {index < result.timeline.length - 1 && (
                              <div className="w-0.5 h-12 bg-primary" />
                            )}
                          </div>
                          {/* Content */}
                          <div className="pt-1 pb-4">
                            <p className="font-medium text-sm text-foreground">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(item.createdAt)}
                            </p>
                            {item.location && (
                              <p className="text-xs text-primary/70 mt-0.5">{item.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Status Steps (visual progress) */}
                  {result.parcel.status !== 'CANCELLED' && result.parcel.status !== 'RETURNED' && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        {statusSteps.map((step, idx) => {
                          const currentIdx = getStatusStepIndex(result.parcel.status);
                          const isDone = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                                    isDone
                                      ? 'bg-primary text-primary-foreground scale-110'
                                      : 'bg-muted text-muted-foreground'
                                  } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                                >
                                  {getStepIcon(step)}
                                </div>
                                <p className={`text-[10px] sm:text-xs mt-2 text-center ${
                                  isDone ? 'text-primary font-semibold' : 'text-muted-foreground'
                                }`}>
                                  {statusMap[step]?.label}
                                </p>
                              </div>
                              {idx < statusSteps.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 transition-all duration-500 ${
                                  idx < currentIdx ? 'bg-primary' : 'bg-border'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
