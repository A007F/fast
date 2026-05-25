'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Types
interface Parcel {
  id: string;
  trackingNumber: string;
  sender: { id: string; name: string; phone: string };
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  status: string;
  captain: { id: string; user: { name: string } } | null;
  deliveryFee: number;
  codAmount: number | null;
  paymentMethod: string;
  paymentStatus: string;
  weight: number | null;
  description: string | null;
  category: string | null;
  senderAddress: string;
  createdAt: string;
  timeline?: {
    id: string;
    status: string;
    description: string;
    location: string | null;
    createdAt: string;
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusMap: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: 'معلق',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  PICKED_UP: {
    label: 'تم الاستلام',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  IN_TRANSIT: {
    label: 'قيد التوصيل',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  DELIVERED: {
    label: 'تم التسليم',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
  },
  CANCELLED: {
    label: 'ملغي',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  RETURNED: {
    label: 'مرتجع',
    color: 'text-violet-700',
    bgColor: 'bg-violet-100',
  },
};

const categoryMap: Record<string, string> = {
  DOCUMENTS: 'وثائق',
  FOOD: 'طعام',
  ELECTRONICS: 'إلكترونيات',
  CLOTHES: 'ملابس',
  OTHER: 'أخرى',
};

const paymentMethodMap: Record<string, string> = {
  CASH: 'نقدي',
  CARD: 'بطاقة',
  WALLET: 'محفظة',
};

export default function ParcelsTable() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [creating, setCreating] = useState(false);

  // Form state
  const [form, setForm] = useState({
    senderAddress: '',
    senderLat: 24.7136,
    senderLng: 46.6753,
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverLat: 24.7136,
    receiverLng: 46.6753,
    weight: '',
    description: '',
    category: '',
    deliveryFee: '15',
    codAmount: '',
    paymentMethod: 'CASH',
  });

  const fetchParcels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      if (statusFilter && statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      if (search) {
        params.set('search', search);
      }
      const res = await fetch(`/api/parcels?${params}`);
      const json = await res.json();
      if (json.success) {
        setParcels(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error('خطأ في جلب الطرود:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, search]);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: 'user_admin_001',
          senderAddress: form.senderAddress,
          senderLat: parseFloat(form.senderLat.toString()) || 24.7136,
          senderLng: parseFloat(form.senderLng.toString()) || 46.6753,
          receiverName: form.receiverName,
          receiverPhone: form.receiverPhone,
          receiverAddress: form.receiverAddress,
          receiverLat: parseFloat(form.receiverLat.toString()) || 24.7136,
          receiverLng: parseFloat(form.receiverLng.toString()) || 46.6753,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          description: form.description || undefined,
          category: form.category || undefined,
          deliveryFee: parseFloat(form.deliveryFee) || 0,
          codAmount: form.codAmount ? parseFloat(form.codAmount) : undefined,
          paymentMethod: form.paymentMethod,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم إنشاء الطرد بنجاح');
        setCreateOpen(false);
        resetForm();
        fetchParcels();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء إنشاء الطرد');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (parcelId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/parcels/${parcelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم تحديث حالة الطرد');
        fetchParcels();
        if (selectedParcel?.id === parcelId) {
          setSelectedParcel({ ...selectedParcel, status: newStatus });
        }
      } else {
        toast.error(json.error || 'حدث خطأ');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const resetForm = () => {
    setForm({
      senderAddress: '',
      senderLat: 24.7136,
      senderLng: 46.6753,
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      receiverLat: 24.7136,
      receiverLng: 46.6753,
      weight: '',
      description: '',
      category: '',
      deliveryFee: '15',
      codAmount: '',
      paymentMethod: 'CASH',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم التتبع أو اسم المستلم..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="pr-10 h-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-44 h-9">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="PENDING">معلق</SelectItem>
                <SelectItem value="PICKED_UP">تم الاستلام</SelectItem>
                <SelectItem value="IN_TRANSIT">قيد التوصيل</SelectItem>
                <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                <SelectItem value="CANCELLED">ملغي</SelectItem>
              </SelectContent>
            </Select>

            {/* Create Button */}
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
            >
              <Plus className="h-4 w-4 ml-1" />
              طرد جديد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>رقم التتبع</TableHead>
                  <TableHead>المرسل</TableHead>
                  <TableHead>المستلم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الكابتن</TableHead>
                  <TableHead>التكلفة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : parcels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <p className="text-muted-foreground">لا توجد طرود</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  parcels.map((parcel, index) => {
                    const status = statusMap[parcel.status] || statusMap.PENDING;
                    return (
                      <motion.tr
                        key={parcel.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/50 border-b transition-colors"
                      >
                        <TableCell className="font-mono text-xs font-medium">
                          {parcel.trackingNumber}
                        </TableCell>
                        <TableCell className="text-sm">
                          {parcel.sender.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {parcel.receiverName}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}
                          >
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {parcel.captain?.user.name || (
                            <span className="text-muted-foreground">
                              غير معيّن
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {parcel.deliveryFee} ر.س
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(parcel.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedParcel(parcel);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                {parcel.status !== 'DELIVERED' &&
                                  parcel.status !== 'CANCELLED' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateStatus(
                                          parcel.id,
                                          'IN_TRANSIT'
                                        )
                                      }
                                    >
                                      تحديث الحالة
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedParcel(parcel);
                                    setDetailsOpen(true);
                                  }}
                                >
                                  عرض التفاصيل
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
            {pagination.total} طرد
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
            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const pageNum = pagination.page <= 3
                    ? i + 1
                    : pagination.page + i - 2;
                  if (pageNum < 1 || pageNum > pagination.totalPages)
                    return null;
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pagination.page === pageNum ? 'default' : 'outline'
                      }
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
            </div>
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

      {/* Create Parcel Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">إنشاء طرد جديد</DialogTitle>
            <DialogDescription className="text-right">
              أدخل بيانات الطرد الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Sender Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                بيانات المرسل
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>عنوان الاستلام</Label>
                  <Input
                    placeholder="عنوان الاستلام"
                    value={form.senderAddress}
                    onChange={(e) =>
                      setForm({ ...form, senderAddress: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>خط العرض</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.senderLat}
                      onChange={(e) =>
                        setForm({ ...form, senderLat: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>خط الطول</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.senderLng}
                      onChange={(e) =>
                        setForm({ ...form, senderLng: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver Info */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                بيانات المستلم
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المستلم *</Label>
                  <Input
                    placeholder="اسم المستلم"
                    value={form.receiverName}
                    onChange={(e) =>
                      setForm({ ...form, receiverName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input
                    placeholder="05XXXXXXXX"
                    value={form.receiverPhone}
                    onChange={(e) =>
                      setForm({ ...form, receiverPhone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>عنوان التوصيل *</Label>
                  <Input
                    placeholder="عنوان التوصيل"
                    value={form.receiverAddress}
                    onChange={(e) =>
                      setForm({ ...form, receiverAddress: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>خط العرض</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.receiverLat}
                      onChange={(e) =>
                        setForm({ ...form, receiverLat: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>خط الطول</Label>
                    <Input
                      type="number"
                      step="any"
                      value={form.receiverLng}
                      onChange={(e) =>
                        setForm({ ...form, receiverLng: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Parcel Details */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                تفاصيل الطرد
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الوزن (كجم)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0.5"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) =>
                      setForm({ ...form, category: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOCUMENTS">وثائق</SelectItem>
                      <SelectItem value="FOOD">طعام</SelectItem>
                      <SelectItem value="ELECTRONICS">إلكترونيات</SelectItem>
                      <SelectItem value="CLOTHES">ملابس</SelectItem>
                      <SelectItem value="OTHER">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>الوصف</Label>
                  <Input
                    placeholder="وصف الطرد (اختياري)"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2">
                الدفع والتكلفة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رسوم التوصيل (ر.س)</Label>
                  <Input
                    type="number"
                    step="any"
                    value={form.deliveryFee}
                    onChange={(e) =>
                      setForm({ ...form, deliveryFee: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>مبلغ الدفع عند الاستلام (ر.س)</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={form.codAmount}
                    onChange={(e) =>
                      setForm({ ...form, codAmount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select
                    value={form.paymentMethod}
                    onValueChange={(val) =>
                      setForm({ ...form, paymentMethod: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">نقدي</SelectItem>
                      <SelectItem value="CARD">بطاقة</SelectItem>
                      <SelectItem value="WALLET">محفظة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={handleCreate}
              disabled={creating || !form.receiverName || !form.receiverPhone || !form.receiverAddress}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {creating && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              إنشاء الطرد
            </Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right">
              تفاصيل الطرد - {selectedParcel?.trackingNumber}
            </DialogTitle>
            <DialogDescription className="text-right">
              معلومات كاملة عن الطرد
            </DialogDescription>
          </DialogHeader>

          {selectedParcel && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">الحالة الحالية</p>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${
                      statusMap[selectedParcel.status]?.color
                    } ${statusMap[selectedParcel.status]?.bgColor}`}
                  >
                    {statusMap[selectedParcel.status]?.label}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">التكلفة</p>
                  <p className="text-lg font-bold text-foreground">
                    {selectedParcel.deliveryFee} ر.س
                  </p>
                </div>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    المرسل
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">الاسم: </span>
                      {selectedParcel.sender.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">العنوان: </span>
                      {selectedParcel.senderAddress}
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    المستلم
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">الاسم: </span>
                      {selectedParcel.receiverName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">الهاتف: </span>
                      {selectedParcel.receiverPhone}
                    </p>
                    <p>
                      <span className="text-muted-foreground">العنوان: </span>
                      {selectedParcel.receiverAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parcel Info */}
              <div className="p-4 rounded-xl border">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  معلومات الطرد
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">التصنيف</p>
                    <p className="font-medium">
                      {categoryMap[selectedParcel.category || ''] || 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الوزن</p>
                    <p className="font-medium">
                      {selectedParcel.weight
                        ? `${selectedParcel.weight} كجم`
                        : 'غير محدد'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">طريقة الدفع</p>
                    <p className="font-medium">
                      {paymentMethodMap[selectedParcel.paymentMethod] ||
                        selectedParcel.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">الدفع عند الاستلام</p>
                    <p className="font-medium">
                      {selectedParcel.codAmount
                        ? `${selectedParcel.codAmount} ر.س`
                        : 'لا يوجد'}
                    </p>
                  </div>
                </div>
                {selectedParcel.description && (
                  <p className="mt-3 text-sm">
                    <span className="text-muted-foreground">الوصف: </span>
                    {selectedParcel.description}
                  </p>
                )}
              </div>

              {/* Captain Info */}
              {selectedParcel.captain && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    الكابتن المعيّن
                  </h4>
                  <p className="text-sm font-medium">
                    {selectedParcel.captain.user.name}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {selectedParcel.status === 'PENDING' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdateStatus(selectedParcel.id, 'PICKED_UP')
                    }
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    تم الاستلام
                  </Button>
                )}
                {selectedParcel.status === 'PICKED_UP' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdateStatus(selectedParcel.id, 'IN_TRANSIT')
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    بدء التوصيل
                  </Button>
                )}
                {selectedParcel.status === 'IN_TRANSIT' && (
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdateStatus(selectedParcel.id, 'DELIVERED')
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    تم التسليم
                  </Button>
                )}
                {selectedParcel.status !== 'DELIVERED' &&
                  selectedParcel.status !== 'CANCELLED' && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleUpdateStatus(selectedParcel.id, 'CANCELLED')
                      }
                    >
                      إلغاء الطرد
                    </Button>
                  )}
              </div>

              {/* Timeline */}
              {selectedParcel.timeline && selectedParcel.timeline.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    سجل الأحداث
                  </h4>
                  <div className="space-y-3 relative pr-6">
                    <div className="absolute right-2 top-2 bottom-2 w-px bg-border" />
                    {selectedParcel.timeline
                      .slice()
                      .reverse()
                      .map((event, index) => (
                        <div key={event.id} className="flex gap-3 relative">
                          <div
                            className={`absolute right-[-20px] top-1.5 h-3 w-3 rounded-full border-2 ${
                              index === 0
                                ? 'bg-primary border-primary'
                                : 'bg-background border-muted-foreground/30'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {event.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(event.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
