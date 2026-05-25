'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  Truck,
  Phone,
  Star,
  Clock,
  Package,
  CheckCircle2,
  Circle,
  CreditCard,
  Headphones,
  MessageSquare,
  Loader2,
  AlertCircle,
  User,
  StarOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import CustomerReviewForm from './CustomerReviewForm';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  PICKED_UP: { label: 'تم الاستلام', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  IN_TRANSIT: { label: 'قيد التوصيل', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  DELIVERED: { label: 'تم التسليم', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  CANCELLED: { label: 'ملغي', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  RETURNED: { label: 'تم الإرجاع', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

const paymentStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  PAID: { label: 'مدفوع', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  REFUNDED: { label: 'مسترد', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
};

const paymentMethodLabels: Record<string, { label: string }> = {
  CASH: { label: 'نقدي' },
  CARD: { label: 'بطاقة ائتمان' },
  WALLET: { label: 'محفظة إلكترونية' },
};

const sizeConfig: Record<string, string> = {
  SMALL: 'صغير',
  MEDIUM: 'متوسط',
  LARGE: 'كبير',
};

const categoryConfig: Record<string, string> = {
  DOCUMENTS: 'وثائق',
  FOOD: 'طعام',
  ELECTRONICS: 'إلكترونيات',
  CLOTHES: 'ملابس',
  OTHER: 'أخرى',
};

const vehicleTypeLabels: Record<string, string> = {
  MOTORCYCLE: 'دراجة نارية',
  CAR: 'سيارة',
  VAN: 'فان',
  TRUCK: 'شاحنة',
};

interface ParcelDetail {
  id: string;
  trackingNumber: string;
  status: string;
  senderAddress: string;
  senderLat: number;
  senderLng: number;
  senderNotes: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverNotes: string | null;
  weight: number | null;
  size: string | null;
  description: string | null;
  category: string | null;
  deliveryFee: number;
  codAmount: number | null;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  estimatedDelivery: string | null;
  sender: {
    id: string;
    name: string;
    phone: string;
    avatar: string | null;
  };
  captain: {
    id: string;
    userId: string;
    vehicleType: string;
    vehicleBrand: string | null;
    licensePlate: string | null;
    rating: number;
    totalDeliveries: number;
    user: {
      id: string;
      name: string;
      phone: string;
      avatar: string | null;
    };
  } | null;
  timeline: {
    id: string;
    status: string;
    description: string;
    location: string | null;
    createdAt: string;
    createdBy: string | null;
  }[];
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    transactionRef: string | null;
    captainEarning: number | null;
    platformFee: number | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  reviews?: {
    id: string;
    rating: number;
    comment: string | null;
  }[];
}

interface ParcelDetailProps {
  parcelId: string;
  onBack: () => void;
  onTrack?: (trackingNumber: string) => void;
}

export default function ParcelDetail({ parcelId, onBack, onTrack }: ParcelDetailProps) {
  const [parcel, setParcel] = useState<ParcelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    const fetchParcel = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/parcels/${parcelId}`);
        const json = await res.json();
        if (json.success) {
          setParcel(json.data);
        } else {
          setError(json.error || 'لم يتم العثور على الطرد');
        }
      } catch (err) {
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchParcel();
  }, [parcelId]);

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

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Back button skeleton */}
        <Skeleton className="h-10 w-24 rounded-xl" />
        {/* Header skeleton */}
        <Skeleton className="h-32 w-full rounded-xl" />
        {/* Route skeleton */}
        <Skeleton className="h-24 w-full rounded-xl" />
        {/* Timeline skeleton */}
        <Skeleton className="h-48 w-full rounded-xl" />
        {/* Payment skeleton */}
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !parcel) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">حدث خطأ</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة
        </Button>
      </div>
    );
  }

  const status = statusConfig[parcel.status] || statusConfig.PENDING;
  const payStatus = paymentStatusConfig[parcel.paymentStatus] || paymentStatusConfig.PENDING;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-muted-foreground hover:text-primary hover:bg-primary/5"
      >
        <ArrowRight className="h-4 w-4 ml-1" />
        العودة
      </Button>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50 overflow-hidden">
          <div className={`h-2 ${
            parcel.status === 'DELIVERED'
              ? 'bg-emerald-500'
              : parcel.status === 'CANCELLED'
                ? 'bg-red-500'
                : 'bg-primary'
          }`} />
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">رقم التتبع</p>
                <p className="font-mono text-lg font-bold text-foreground tracking-wide" dir="ltr">
                  {parcel.trackingNumber}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  تم الإنشاء: {formatDateTime(parcel.createdAt)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-sm font-medium border ${status.bg} ${status.color}`}
              >
                {status.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Route Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              مسار التوصيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sender */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">من</p>
                  <p className="text-sm font-medium text-foreground">{parcel.senderAddress}</p>
                  {parcel.senderNotes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{parcel.senderNotes}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-0.5 h-4 bg-border" />
                  <Truck className="h-5 w-5 text-primary" />
                  <div className="w-0.5 h-4 bg-border" />
                </div>
              </div>

              {/* Receiver */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-red-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">إلى</p>
                  <p className="text-sm font-medium text-foreground">{parcel.receiverName}</p>
                  <p className="text-sm text-foreground">{parcel.receiverAddress}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" dir="ltr">{parcel.receiverPhone}</p>
                  {parcel.receiverNotes && (
                    <p className="text-xs text-muted-foreground mt-0.5">{parcel.receiverNotes}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Captain Section */}
      {parcel.captain && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                الكابتن المكلف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                      {parcel.captain.user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-foreground">{parcel.captain.user.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium">{parcel.captain.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {vehicleTypeLabels[parcel.captain.vehicleType] || parcel.captain.vehicleType}
                      </span>
                      {parcel.captain.vehicleBrand && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{parcel.captain.vehicleBrand}</span>
                        </>
                      )}
                    </div>
                    {parcel.captain.licensePlate && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        رقم اللوحة: {parcel.captain.licensePlate}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    window.open(`tel:${parcel.captain.user.phone}`, '_self');
                  }}
                >
                  <Phone className="h-4 w-4 ml-1" />
                  اتصال
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Timeline Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              سجل الأحداث
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                {[...parcel.timeline].reverse().map((event, idx) => (
                  <div key={event.id} className="flex gap-3 relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      idx === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border-2 border-primary/30'
                    }`}>
                      {idx === 0 ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-2.5 w-2.5" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="text-sm font-medium text-foreground">{event.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
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

      {/* Payment Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              معلومات الدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">رسوم التوصيل</p>
                <p className="text-base font-bold text-foreground">{parcel.deliveryFee} ر.س</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">الدفع عند الاستلام</p>
                <p className="text-base font-bold text-foreground">
                  {parcel.codAmount ? `${parcel.codAmount} ر.س` : '—'}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">طريقة الدفع</p>
                <p className="text-sm font-bold text-foreground">
                  {paymentMethodLabels[parcel.paymentMethod]?.label || parcel.paymentMethod}
                </p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">حالة الدفع</p>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs ${payStatus.bg} ${payStatus.color}`}
                >
                  {payStatus.label}
                </Badge>
              </div>
            </div>

            {/* Parcel Details */}
            <Separator />
            <div>
              <p className="text-sm font-medium text-foreground mb-2">تفاصيل الطرد</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {parcel.category && (
                  <div>
                    <span className="text-muted-foreground">الفئة: </span>
                    <span className="font-medium">{categoryConfig[parcel.category] || parcel.category}</span>
                  </div>
                )}
                {parcel.size && (
                  <div>
                    <span className="text-muted-foreground">الحجم: </span>
                    <span className="font-medium">{sizeConfig[parcel.size] || parcel.size}</span>
                  </div>
                )}
                {parcel.weight && (
                  <div>
                    <span className="text-muted-foreground">الوزن: </span>
                    <span className="font-medium">{parcel.weight} كجم</span>
                  </div>
                )}
              </div>
              {parcel.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  الوصف: <span className="text-foreground">{parcel.description}</span>
                </p>
              )}
            </div>

            {/* Cancel Reason */}
            {parcel.cancelReason && (
              <>
                <Separator />
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700">سبب الإلغاء</p>
                  <p className="text-sm text-red-600 mt-1">{parcel.cancelReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Review Button for Delivered Parcels */}
      {parcel.status === 'DELIVERED' && parcel.captain && !parcel.reviews?.length && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <StarOff className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">قيّم التوصيل</p>
                    <p className="text-xs text-muted-foreground">شاركنا رأيك في خدمة التوصيل</p>
                  </div>
                </div>
                <Button
                  onClick={() => setReviewOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Star className="h-4 w-4 ml-1" />
                  تقييم
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Already Reviewed Indicator */}
      {parcel.status === 'DELIVERED' && parcel.reviews && parcel.reviews.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">تم التقييم</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= (parcel.reviews?.[0]?.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-emerald-200'
                        }`}
                      />
                    ))}
                    {parcel.reviews[0].comment && (
                      <span className="text-xs text-muted-foreground mr-2">
                        &quot;{parcel.reviews[0].comment}&quot;
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => onTrack?.(parcel.trackingNumber)}
              >
                <MapPin className="h-4 w-4 ml-1" />
                تتبع
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => {
                  window.open('tel:+966500000001', '_self');
                }}
              >
                <Headphones className="h-4 w-4 ml-1" />
                اتصل بالدعم
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/5"
              >
                <MessageSquare className="h-4 w-4 ml-1" />
                تقديم شكوى
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Customer Review Form Dialog */}
      {parcel.captain && (
        <CustomerReviewForm
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          parcelId={parcel.id}
          captainId={parcel.captain.id}
          captainName={parcel.captain.user.name}
          onSuccess={() => {
            // Re-fetch parcel to show review status
            const fetchUpdated = async () => {
              try {
                const res = await fetch(`/api/parcels/${parcelId}`);
                const json = await res.json();
                if (json.success) setParcel(json.data);
              } catch { /* silent */ }
            };
            fetchUpdated();
          }}
        />
      )}
    </div>
  );
}
