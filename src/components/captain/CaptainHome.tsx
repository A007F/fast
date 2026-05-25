'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Star,
  DollarSign,
  Truck,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Clock,
  Loader2,
  PackageOpen,
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
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  senderAddress: string;
  deliveryFee: number;
  category?: string | null;
  weight?: number | null;
  codAmount?: number | null;
  createdAt: string;
  estimatedDelivery?: string | null;
}

interface Stats {
  todayDeliveries: number;
  todayEarnings: number;
  rating: number;
}

const statusLabels: Record<string, string> = {
  PICKED_UP: 'تم الاستلام',
  IN_TRANSIT: 'قيد التوصيل',
  PENDING: 'بانتظار الاستلام',
  DELIVERED: 'تم التسليم',
};

const statusColors: Record<string, string> = {
  PICKED_UP: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_TRANSIT: 'bg-amber-100 text-amber-700 border-amber-200',
  PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function CaptainHome() {
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [stats, setStats] = useState<Stats>({ todayDeliveries: 0, todayEarnings: 0, rating: 4.8 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/parcels?captainId=${CAPTAIN_ID}&limit=50`);
      const json = await res.json();
      if (json.success) {
        const activeStatuses = ['PICKED_UP', 'IN_TRANSIT', 'PENDING'];
        const filtered = json.data.filter((p: ParcelData) =>
          activeStatuses.includes(p.status)
        );
        setParcels(filtered);

        // Calculate stats from all parcels
        const allParcels = json.data as ParcelData[];
        const today = new Date().toISOString().split('T')[0];
        const todayDelivered = allParcels.filter(
          (p) => p.status === 'DELIVERED' && p.createdAt?.startsWith(today)
        ).length;
        const todayEarnings = allParcels
          .filter((p) => p.createdAt?.startsWith(today) && p.status === 'DELIVERED')
          .reduce((sum: number, p: ParcelData) => sum + (p.deliveryFee * 0.8), 0);

        setStats({
          todayDeliveries,
          todayEarnings: Math.round(todayEarnings * 100) / 100,
          rating: 4.8,
        });
      }
    } catch {
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParcelStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/parcels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          newStatus === 'IN_TRANSIT'
            ? 'تم بدء التوصيل بنجاح'
            : newStatus === 'DELIVERED'
            ? 'تم تسليم الطرد بنجاح'
            : 'تم تحديث الحالة'
        );
        fetchData();
      } else {
        toast.error('حدث خطأ في تحديث الحالة');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeDeliveries = parcels.filter(
    (p) => p.status === 'PICKED_UP' || p.status === 'IN_TRANSIT'
  );
  const pendingPickups = parcels.filter((p) => p.status === 'PENDING');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gradient-to-bl from-emerald-500 to-emerald-700 border-0 text-white overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="relative">
              <h2 className="text-xl font-bold">أهلاً سالم! 👋</h2>
              <p className="text-emerald-100 text-sm mt-1">
                {new Date().toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-emerald-200 text-xs mt-2">
                استمر في العمل الجيد! لديك {activeDeliveries.length} توصيلة نشطة
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'التوصيلات اليوم',
            value: stats.todayDeliveries,
            icon: PackageCheck,
            color: 'bg-emerald-50 text-emerald-700',
          },
          {
            label: 'الإيرادات اليوم',
            value: `${stats.todayEarnings} ر.س`,
            icon: DollarSign,
            color: 'bg-yellow-50 text-yellow-700',
          },
          {
            label: 'التقييم',
            value: stats.rating.toFixed(1),
            icon: Star,
            color: 'bg-amber-50 text-amber-700',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-3 text-center">
                <div
                  className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-base font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Deliveries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-primary" />
            التوصيلات النشطة
          </h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            {activeDeliveries.length}
          </Badge>
        </div>

        {activeDeliveries.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                لا توجد توصيلات نشطة حالياً
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                انتظر طلبات جديدة أو استعرض الطلبات المتاحة
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {activeDeliveries.map((parcel) => (
                <motion.div
                  key={parcel.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-border/60 hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {parcel.trackingNumber}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {parcel.receiverName}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusColors[parcel.status] || ''}`}
                        >
                          {statusLabels[parcel.status]}
                        </Badge>
                      </div>

                      {/* Address */}
                      <div className="mt-3 flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {parcel.receiverAddress}
                        </p>
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {expandedId === parcel.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2.5">
                              <div className="flex items-start gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-[10px] text-muted-foreground">من:</p>
                                  <p className="text-xs text-foreground">{parcel.senderAddress}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                                <a
                                  href={`tel:${parcel.receiverPhone}`}
                                  className="text-xs text-primary hover:underline"
                                >
                                  {parcel.receiverPhone}
                                </a>
                              </div>
                              {parcel.codAmount && parcel.codAmount > 0 && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span className="text-xs text-amber-700 font-medium">
                                    الدفع عند الاستلام: {parcel.codAmount} ر.س
                                  </span>
                                </div>
                              )}
                              {/* Map placeholder */}
                              <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center mt-2">
                                <div className="text-center">
                                  <MapPin className="h-6 w-6 text-gray-400 mx-auto" />
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    خريطة التوصيل
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() =>
                            setExpandedId(expandedId === parcel.id ? null : parcel.id)
                          }
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                          {expandedId === parcel.id ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              إخفاء التفاصيل
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              عرض التفاصيل
                            </>
                          )}
                        </button>
                        <Button
                          size="sm"
                          disabled={updatingId === parcel.id}
                          onClick={() =>
                            updateParcelStatus(
                              parcel.id,
                              parcel.status === 'PICKED_UP' ? 'IN_TRANSIT' : 'DELIVERED'
                            )
                          }
                          className={`text-xs rounded-lg px-4 h-8 ${
                            parcel.status === 'PICKED_UP'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {updatingId === parcel.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : parcel.status === 'PICKED_UP' ? (
                            <>
                              <Truck className="h-3.5 w-3.5 ml-1" />
                              بدء التوصيل
                            </>
                          ) : (
                            <>
                              <PackageCheck className="h-3.5 w-3.5 ml-1" />
                              تم التسليم
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Pending Pickups */}
      {pendingPickups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <PackageOpen className="h-4.5 w-4.5 text-amber-500" />
              بانتظار الاستلام
            </h3>
            <Badge
              variant="secondary"
              className="bg-amber-50 text-amber-700 text-xs"
            >
              {pendingPickups.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {pendingPickups.map((parcel) => (
              <motion.div
                key={parcel.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-amber-200/50 bg-amber-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Clock className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-mono">
                            {parcel.trackingNumber}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {parcel.receiverName}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-gray-100 text-gray-700 border-gray-200"
                      >
                        بانتظار الاستلام
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {parcel.receiverAddress}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        disabled={updatingId === parcel.id}
                        onClick={() => updateParcelStatus(parcel.id, 'PICKED_UP')}
                        className="text-xs rounded-lg px-4 h-8 bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        {updatingId === parcel.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'استلام'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
