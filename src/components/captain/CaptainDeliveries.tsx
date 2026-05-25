'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  MapPin,
  Phone,
  Truck,
  PackageCheck,
  Clock,
  Loader2,
  PackageOpen,
  RefreshCw,
  Navigation,
  User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  pickedUpAt?: string | null;
}

const statusLabels: Record<string, string> = {
  PICKED_UP: 'بانتظار الاستلام',
  IN_TRANSIT: 'قيد التوصيل',
  PENDING: 'بانتظار الاستلام',
};

const statusColors: Record<string, string> = {
  PICKED_UP: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_TRANSIT: 'bg-amber-100 text-amber-700 border-amber-200',
  PENDING: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function CaptainDeliveries() {
  const [parcels, setParcels] = useState<ParcelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ParcelData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);

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
      }
    } catch {
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY.current;
    if (diff > 80 && window.scrollY <= 0) {
      setIsRefreshing(true);
      fetchData();
    }
    touchStartY.current = null;
  };

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
            : 'تم تسليم الطرد بنجاح 🎉'
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

  const pickedUpParcels = parcels.filter((p) => p.status === 'PICKED_UP' || p.status === 'PENDING');
  const inTransitParcels = parcels.filter((p) => p.status === 'IN_TRANSIT');

  function getTimeSince(dateStr: string | null | undefined): string {
    if (!dateStr) return 'الآن';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    return `منذ ${hours} ساعة`;
  }

  function getEstimatedTime(parcel: ParcelData): string {
    if (parcel.estimatedDelivery) {
      return new Date(parcel.estimatedDelivery).toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return '30-45 دقيقة';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="space-y-5 pb-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 40 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            جارٍ التحديث...
          </motion.div>
        )}
      </AnimatePresence>

      {parcels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-dashed border-2 border-border/50 mt-4">
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-9 w-9 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-muted-foreground">
                لا توجد توصيلات نشطة
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                انتظر تعيين طلبات جديدة لك
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* In Transit Section */}
          {inTransitParcels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Navigation className="h-4.5 w-4.5 text-amber-500" />
                  قيد التوصيل
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 text-xs"
                >
                  {inTransitParcels.length}
                </Badge>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {inTransitParcels.map((parcel) => (
                    <motion.div
                      key={parcel.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.4 } }}
                    >
                      <Card className="border-amber-200/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Truck className="h-5 w-5 text-amber-600" />
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
                              className="text-[10px] bg-amber-100 text-amber-700 border-amber-200"
                            >
                              {statusLabels[parcel.status]}
                            </Badge>
                          </div>

                          {/* Info rows */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <a
                                href={`tel:${parcel.receiverPhone}`}
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                {parcel.receiverPhone}
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard?.writeText(parcel.receiverPhone);
                                  toast.success('تم نسخ رقم الهاتف');
                                }}
                                className="text-[10px] text-muted-foreground hover:text-foreground"
                              >
                                نسخ
                              </button>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                {parcel.receiverAddress}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                {parcel.senderAddress}
                              </p>
                            </div>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground bg-gray-50 rounded-lg px-3 py-2">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              المتوقع: {getEstimatedTime(parcel)}
                            </span>
                            <span className="flex items-center gap-1">
                              <PackageOpen className="h-3 w-3" />
                              {getTimeSince(parcel.pickedUpAt)}
                            </span>
                            {parcel.codAmount && parcel.codAmount > 0 && (
                              <span className="text-amber-700 font-medium">
                                {parcel.codAmount} ر.س
                              </span>
                            )}
                          </div>

                          {/* Action */}
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              disabled={updatingId === parcel.id}
                              onClick={() => setConfirmDialog(parcel)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 h-9 text-sm font-semibold"
                            >
                              {updatingId === parcel.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <PackageCheck className="h-4 w-4 ml-1" />
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
            </motion.div>
          )}

          {/* Pending Pickup Section */}
          {pickedUpParcels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <PackageOpen className="h-4.5 w-4.5 text-blue-500" />
                  بانتظار الاستلام
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 text-xs"
                >
                  {pickedUpParcels.length}
                </Badge>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {pickedUpParcels.map((parcel) => (
                    <motion.div
                      key={parcel.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
                    >
                      <Card className="border-blue-200/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <PackageOpen className="h-5 w-5 text-blue-600" />
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

                          {/* Info rows */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                              <a
                                href={`tel:${parcel.receiverPhone}`}
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                {parcel.receiverPhone}
                              </a>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                {parcel.receiverAddress}
                              </p>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                {parcel.senderAddress}
                              </p>
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              disabled={updatingId === parcel.id}
                              onClick={() => updateParcelStatus(parcel.id, 'IN_TRANSIT')}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 h-9 text-sm font-semibold"
                            >
                              {updatingId === parcel.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Truck className="h-4 w-4 ml-1" />
                                  بدء التوصيل
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
            </motion.div>
          )}
        </>
      )}

      {/* Confirm Delivery Dialog */}
      <AlertDialog
        open={!!confirmDialog}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-emerald-600" />
              تأكيد التسليم
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل تريد تأكيد تسليم الطرد إلى{' '}
              <span className="font-semibold text-foreground">
                {confirmDialog?.receiverName}
              </span>
              ؟
              <br />
              رقم التتبع:{' '}
              <span className="font-mono text-primary">
                {confirmDialog?.trackingNumber}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:flex-row-reverse">
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog) {
                  updateParcelStatus(confirmDialog.id, 'DELIVERED');
                  setConfirmDialog(null);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            >
              نعم، تم التسليم
            </AlertDialogAction>
            <AlertDialogCancel className="flex-1">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
