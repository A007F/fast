'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Wallet,
  TrendingUp,
  Clock,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  User,
  Calendar,
  Loader2,
  ArrowUpLeft,
  ArrowDownLeft,
  Banknote,
  CreditCard as CardIcon,
  Smartphone,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ============================================
// Types
// ============================================
interface PaymentItem {
  id: string;
  parcelId: string;
  amount: number;
  method: string;
  status: string;
  transactionRef: string | null;
  captainEarning: number | null;
  platformFee: number | null;
  paidAt: string | null;
  createdAt: string;
  parcel?: {
    trackingNumber: string;
    receiverName: string;
    status: string;
  };
}

interface PaymentStats {
  totalRevenue: number;
  captainEarnings: number;
  platformFees: number;
  pendingPayments: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// Config Maps
// ============================================
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  COMPLETED: { label: 'مكتمل', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  PENDING: { label: 'معلق', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  FAILED: { label: 'فاشل', color: 'text-red-700', bgColor: 'bg-red-100' },
  REFUNDED: { label: 'مسترد', color: 'text-blue-700', bgColor: 'bg-blue-100' },
};

const methodConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  CASH: { label: 'نقدي', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: Banknote },
  CARD: { label: 'بطاقة', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CardIcon },
  WALLET: { label: 'محفظة', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Smartphone },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ============================================
// Main Component
// ============================================
export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0, captainEarnings: 0, platformFees: 0, pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ============================================
  // Fetch payments
  // ============================================
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (methodFilter !== 'ALL') params.set('method', methodFilter);
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/payments?${params}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (json.success) {
        setPayments(json.data || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.stats) setStats(json.stats);
      }
    } catch {
      toast.error('حدث خطأ في جلب المدفوعات');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, methodFilter, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ============================================
  // Open detail
  // ============================================
  const openDetail = async (payment: PaymentItem) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setSelectedPayment(payment);
    setDetailLoading(false);
  };

  // ============================================
  // Format helpers
  // ============================================
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإيرادات', value: stats.totalRevenue, icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10', prefix: '' },
          { label: 'حصص الكبائن', value: stats.captainEarnings, icon: Wallet, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10', prefix: '' },
          { label: 'رسوم المنصة', value: stats.platformFees, icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-500/10', prefix: '' },
          { label: 'مدفوعات معلقة', value: stats.pendingPayments, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-500/10', prefix: '' },
        ].map((stat, i) => (
          <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>
                      {loading ? <Skeleton className="h-7 w-16" /> : `${stat.prefix}${stat.value} ر.س`}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم المعاملة أو رقم التتبع..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="pr-10 h-9"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-36 h-9">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">الكل</SelectItem>
                  <SelectItem value="PENDING">معلق</SelectItem>
                  <SelectItem value="COMPLETED">مكتمل</SelectItem>
                  <SelectItem value="FAILED">فاشل</SelectItem>
                  <SelectItem value="REFUNDED">مسترد</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">الكل</SelectItem>
                  <SelectItem value="CASH">نقدي</SelectItem>
                  <SelectItem value="CARD">بطاقة</SelectItem>
                  <SelectItem value="WALLET">محفظة</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="w-36 h-9"
                placeholder="من"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="w-36 h-9"
                placeholder="إلى"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table (Desktop) */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>رقم المعاملة</TableHead>
                  <TableHead>الطرد / الكابتن</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الطريقة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">لا توجد مدفوعات</p>
                        <p className="text-sm text-muted-foreground/70">جرب تغيير معايير البحث</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment, index) => {
                    const sConf = statusConfig[payment.status] || statusConfig.PENDING;
                    const mConf = methodConfig[payment.method] || methodConfig.CASH;
                    const MethodIcon = mConf.icon;
                    return (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/50 border-b transition-colors cursor-pointer"
                        onClick={() => openDetail(payment)}
                      >
                        <TableCell className="font-mono text-xs">
                          {payment.transactionRef || payment.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{payment.parcel?.trackingNumber || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{payment.amount} ر.س</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${mConf.color} ${mConf.bgColor}`}>
                            <MethodIcon className="h-3 w-3" />
                            {mConf.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${sConf.color} ${sConf.bgColor}`}>
                            {sConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(payment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
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

      {/* Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-32" />
            </CardContent></Card>
          ))
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">لا توجد مدفوعات</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          payments.map((payment, index) => {
            const sConf = statusConfig[payment.status] || statusConfig.PENDING;
            const mConf = methodConfig[payment.method] || methodConfig.CASH;
            const MethodIcon = mConf.icon;
            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetail(payment)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">
                            {payment.transactionRef || payment.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Package className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{payment.parcel?.trackingNumber || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${mConf.color} ${mConf.bgColor}`}>
                            <MethodIcon className="h-3 w-3" />
                            {mConf.label}
                          </span>
                          <Badge variant="outline" className={`text-[10px] ${sConf.color} ${sConf.bgColor}`}>
                            {sConf.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-bold text-foreground">{payment.amount} ر.س</p>
                        <p className="text-[10px] text-muted-foreground">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
            {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
              <ChevronRight className="h-4 w-4 ml-1" /> السابق
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pn = pagination.page <= 3 ? i + 1 : pagination.page + i - 2;
                if (pn < 1 || pn > pagination.totalPages) return null;
                return (
                  <Button key={pn} variant={pagination.page === pn ? 'default' : 'outline'}
                    size="sm" className="w-8 h-8 p-0"
                    onClick={() => setPagination(p => ({ ...p, page: pn }))}>
                    {pn}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
              التالي <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              تفاصيل المعاملة
            </DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 mt-2">
              {/* Status & Method */}
              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const sConf = statusConfig[selectedPayment.status] || statusConfig.PENDING;
                  const mConf = methodConfig[selectedPayment.method] || methodConfig.CASH;
                  const MIcon = mConf.icon;
                  return (
                    <>
                      <Badge variant="outline" className={`text-xs ${sConf.color} ${sConf.bgColor}`}>
                        {sConf.label}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${mConf.color} ${mConf.bgColor}`}>
                        <MIcon className="h-3 w-3" /> {mConf.label}
                      </span>
                    </>
                  );
                })()}
              </div>

              {/* Amount */}
              <div className="p-4 rounded-xl bg-gradient-to-l from-emerald-50 to-emerald-100/50 border border-emerald-200">
                <p className="text-xs text-muted-foreground">المبلغ</p>
                <p className="text-3xl font-bold text-emerald-700">{selectedPayment.amount} ر.س</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">رقم المعاملة</p>
                  <p className="text-sm font-medium font-mono mt-1">
                    {selectedPayment.transactionRef || selectedPayment.id.slice(0, 12)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">رقم الطرد</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedPayment.parcel?.trackingNumber || '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">حصة الكابتن</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">
                    {selectedPayment.captainEarning ? `${selectedPayment.captainEarning} ر.س` : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">رسوم المنصة</p>
                  <p className="text-sm font-bold text-amber-600 mt-1">
                    {selectedPayment.platformFee ? `${selectedPayment.platformFee} ر.س` : '—'}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">تاريخ الإنشاء</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedPayment.createdAt)}</p>
                  </div>
                </div>
                {selectedPayment.paidAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">تاريخ الدفع</p>
                      <p className="text-sm font-medium">{formatDateTime(selectedPayment.paidAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="text-sm font-semibold mb-2">مسار الحالة</h4>
                <div className="relative">
                  <div className="absolute right-[11px] top-2 bottom-2 w-0.5 bg-border" />
                  <div className="space-y-3">
                    <div className="flex gap-3 relative">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 z-10">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">تم إنشاء المعاملة</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(selectedPayment.createdAt)}</p>
                      </div>
                    </div>
                    {selectedPayment.status === 'COMPLETED' && (
                      <div className="flex gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10">
                          <ArrowUpLeft className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-emerald-700">تم الدفع بنجاح</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedPayment.paidAt ? formatDateTime(selectedPayment.paidAt) : formatDateTime(selectedPayment.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedPayment.status === 'FAILED' && (
                      <div className="flex gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 z-10">
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">فشلت المعاملة</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(selectedPayment.createdAt)}</p>
                        </div>
                      </div>
                    )}
                    {selectedPayment.status === 'REFUNDED' && (
                      <div className="flex gap-3 relative">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 z-10">
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700">تم الاسترداد</p>
                          <p className="text-xs text-muted-foreground">{formatDateTime(selectedPayment.createdAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
