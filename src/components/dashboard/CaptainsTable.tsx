'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Eye,
  Power,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Bike,
  Car,
  Truck as TruckIcon,
  Clock,
  Package,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Captain {
  id: string;
  vehicleType: string;
  vehicleBrand: string | null;
  licensePlate: string | null;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  totalRatingCount: number;
  currentLatitude: number | null;
  currentLongitude: number | null;
  idVerified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    avatar: string | null;
    isActive: boolean;
  };
  _count: {
    parcels: number;
    locations: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const vehicleTypeMap: Record<string, { label: string; icon: React.ElementType }> = {
  MOTORCYCLE: { label: 'دراجة نارية', icon: Bike },
  CAR: { label: 'سيارة', icon: Car },
  VAN: { label: 'فان', icon: TruckIcon },
  TRUCK: { label: 'شاحنة', icon: TruckIcon },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? 'fill-emerald-500 text-emerald-500'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground mr-1">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export default function CaptainsTable() {
  const [captains, setCaptains] = useState<Captain[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCaptain, setSelectedCaptain] = useState<Captain | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchCaptains = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      const res = await fetch(`/api/captains?${params}`);
      const json = await res.json();
      if (json.success) {
        setCaptains(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error('خطأ في جلب الكبائن:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    fetchCaptains();
  }, [fetchCaptains]);

  const toggleOnlineStatus = async (captain: Captain) => {
    try {
      const res = await fetch(`/api/captains/${captain.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: !captain.isOnline }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          captain.isOnline
            ? `تم تسجيل خروج ${captain.user.name}`
            : `تم تسجيل دخول ${captain.user.name}`
        );
        fetchCaptains();
      } else {
        toast.error(json.error || 'حدث خطأ');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الكبائن</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {loading ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      pagination.total
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">متصل الآن</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    {loading ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      captains.filter((c) => c.isOnline).length
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Power className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">غير متصل</p>
                  <p className="text-xl font-bold text-muted-foreground mt-1">
                    {loading ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      captains.filter((c) => !c.isOnline).length
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <PowerOff className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">قائمة الكبائن</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>الكابتن</TableHead>
                  <TableHead>المركبة</TableHead>
                  <TableHead>رقم اللوحة</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>التوصيلات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : captains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <p className="text-muted-foreground">لا يوجد كبائن</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  captains.map((captain, index) => {
                    const vehicle = vehicleTypeMap[captain.vehicleType] || {
                      label: captain.vehicleType,
                      icon: Car,
                    };
                    const VehicleIcon = vehicle.icon;

                    return (
                      <motion.tr
                        key={captain.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/50 border-b transition-colors"
                      >
                        {/* Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                  {captain.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-background ${
                                  captain.isOnline
                                    ? 'bg-emerald-500'
                                    : 'bg-gray-400'
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {captain.user.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {captain.user.phone}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Vehicle */}
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                            <span>{vehicle.label}</span>
                            {captain.vehicleBrand && (
                              <span className="text-muted-foreground text-xs">
                                ({captain.vehicleBrand})
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* License Plate */}
                        <TableCell className="text-sm font-mono">
                          {captain.licensePlate || '—'}
                        </TableCell>

                        {/* Rating */}
                        <TableCell>
                          <StarRating rating={captain.rating} />
                        </TableCell>

                        {/* Deliveries */}
                        <TableCell className="text-sm font-medium">
                          {captain.totalDeliveries}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge
                            className={
                              captain.isOnline
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
                            }
                          >
                            {captain.isOnline ? 'متصل' : 'غير متصل'}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedCaptain(captain);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 ${
                                captain.isOnline
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-emerald-500 hover:text-emerald-600'
                              }`}
                              onClick={() => toggleOnlineStatus(captain)}
                            >
                              {captain.isOnline ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
            {pagination.total} كابتن
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">
              تفاصيل الكابتن
            </DialogTitle>
            <DialogDescription className="text-right">
              معلومات كاملة عن الكابتن
            </DialogDescription>
          </DialogHeader>

          {selectedCaptain && (
            <div className="space-y-5 py-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {selectedCaptain.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-3 border-background ${
                      selectedCaptain.isOnline
                        ? 'bg-emerald-500'
                        : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedCaptain.user.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedCaptain.user.phone}
                    </span>
                  </div>
                  <StarRating rating={selectedCaptain.rating} />
                </div>
                <Badge
                  className={
                    selectedCaptain.isOnline
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }
                >
                  {selectedCaptain.isOnline ? 'متصل' : 'غير متصل'}
                </Badge>
              </div>

              {/* Vehicle Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">معلومات المركبة</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">نوع المركبة</p>
                    <p className="font-medium">
                      {vehicleTypeMap[selectedCaptain.vehicleType]?.label ||
                        selectedCaptain.vehicleType}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الماركة</p>
                    <p className="font-medium">
                      {selectedCaptain.vehicleBrand || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">رقم اللوحة</p>
                    <p className="font-medium font-mono">
                      {selectedCaptain.licensePlate || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الهوية موثقة</p>
                    <p className="font-medium">
                      {selectedCaptain.idVerified ? 'نعم ✓' : 'لا'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">الإحصائيات</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedCaptain.totalDeliveries}
                    </p>
                    <p className="text-xs text-muted-foreground">توصيل</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedCaptain._count.parcels}
                    </p>
                    <p className="text-xs text-muted-foreground">طرود</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedCaptain._count.locations}
                    </p>
                    <p className="text-xs text-muted-foreground">تحديثات</p>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              {selectedCaptain.currentLatitude &&
                selectedCaptain.currentLongitude && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        الموقع الحالي
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-40 rounded-lg bg-muted flex items-center justify-center border border-dashed border-border">
                        <div className="text-center">
                          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">
                            خط العرض: {selectedCaptain.currentLatitude.toFixed(4)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            خط الطول: {selectedCaptain.currentLongitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Joined Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>تاريخ الانضمام: {formatDate(selectedCaptain.createdAt)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
