'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Percent,
  DollarSign,
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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

// ============================================
// Types
// ============================================
interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  maxUses: number | null;
  usedCount: number;
  startsAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface PromoStats {
  activeCodes: number;
  totalUsage: number;
  totalSavings: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// Constants
// ============================================
const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  active: { label: 'نشط', color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
  expired: { label: 'منتهي', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock },
  disabled: { label: 'معطل', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
};

const getPromoStatus = (promo: PromoCode): string => {
  if (!promo.isActive) return 'disabled';
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return 'expired';
  return 'active';
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const emptyForm = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  maxUses: '',
  expiresAt: '',
};

// ============================================
// Main Component
// ============================================
export default function AdminPromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [stats, setStats] = useState<PromoStats>({ activeCodes: 0, totalUsage: 0, totalSavings: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<PromoCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ============================================
  // Fetch promo codes
  // ============================================
  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/promo-codes?${params}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (json.success) {
        setCodes(json.data || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.stats) setStats(json.stats);
      }
    } catch {
      toast.error('حدث خطأ في جلب الكوبونات');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, search]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // ============================================
  // Auto-generate code
  // ============================================
  const generateCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setForm(f => ({ ...f, code: `SAVE${random}` }));
  };

  // ============================================
  // Validate form
  // ============================================
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = 'الكود مطلوب';
    if (!form.discountValue || Number(form.discountValue) <= 0) errors.discountValue = 'قيمة الخصم مطلوبة';
    if (form.discountType === 'PERCENTAGE' && Number(form.discountValue) > 100) errors.discountValue = 'النسبة لا يمكن أن تتجاوز 100%';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // Create promo code
  // ============================================
  const handleCreate = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase().trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
      };
      if (form.description.trim()) body.description = form.description.trim();
      if (form.minOrderAmount) body.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscount) body.maxDiscount = Number(form.maxDiscount);
      if (form.maxUses) body.maxUses = Number(form.maxUses);
      if (form.expiresAt) body.expiresAt = form.expiresAt;

      const res = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم إنشاء الكوبون بنجاح');
        setCreateOpen(false);
        setForm(emptyForm);
        fetchCodes();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء إنشاء الكوبون');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Edit promo code
  // ============================================
  const openEdit = (code: PromoCode) => {
    setSelectedCode(code);
    setForm({
      code: code.code,
      description: code.description || '',
      discountType: code.discountType,
      discountValue: code.discountValue.toString(),
      minOrderAmount: code.minOrderAmount.toString(),
      maxDiscount: code.maxDiscount?.toString() || '',
      maxUses: code.maxUses?.toString() || '',
      expiresAt: code.expiresAt ? code.expiresAt.split('T')[0] : '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedCode || !validateForm()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const body: Record<string, unknown> = {
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        description: form.description.trim() || null,
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      const res = await fetch(`/api/promo-codes/${selectedCode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم تحديث الكوبون بنجاح');
        setEditOpen(false);
        fetchCodes();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء التحديث');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Delete / Deactivate
  // ============================================
  const handleDelete = async () => {
    if (!selectedCode) return;
    try {
      const token = localStorage.getItem('saree3_token');
      const res = await fetch(`/api/promo-codes/${selectedCode.id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم حذف الكوبون بنجاح');
        setDeleteOpen(false);
        setDetailOpen(false);
        fetchCodes();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء الحذف');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  // ============================================
  // Copy code
  // ============================================
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`تم نسخ الكود: ${code}`);
  };

  // ============================================
  // Format helpers
  // ============================================
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // ============================================
  // Form fields component
  // ============================================
  const FormFields = () => (
    <div className="space-y-4 py-4">
      {/* Code */}
      <div className="space-y-2">
        <Label>كود الكوبون <span className="text-red-500">*</span></Label>
        <div className="flex gap-2">
          <Input
            placeholder="مثال: WELCOME20"
            value={form.code}
            onChange={(e) => {
              setForm({ ...form, code: e.target.value.toUpperCase() });
              if (formErrors.code) setFormErrors({ ...formErrors, code: '' });
            }}
            className={formErrors.code ? 'border-red-500' : ''}
            dir="ltr"
            disabled={editOpen}
          />
          {!editOpen && (
            <Button type="button" variant="outline" onClick={generateCode} className="shrink-0">
              <RefreshCw className="h-4 w-4 ml-1" />
              توليد
            </Button>
          )}
        </div>
        {formErrors.code && <p className="text-xs text-red-500">{formErrors.code}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>الوصف</Label>
        <Textarea
          placeholder="وصف اختياري للكوبون..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>نوع الخصم <span className="text-red-500">*</span></Label>
          <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">نسبة مئوية (%)</SelectItem>
              <SelectItem value="FIXED">مبلغ ثابت (ر.س)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>قيمة الخصم <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            placeholder={form.discountType === 'PERCENTAGE' ? '20' : '50'}
            value={form.discountValue}
            onChange={(e) => {
              setForm({ ...form, discountValue: e.target.value });
              if (formErrors.discountValue) setFormErrors({ ...formErrors, discountValue: '' });
            }}
            className={formErrors.discountValue ? 'border-red-500' : ''}
            dir="ltr"
          />
          {formErrors.discountValue && <p className="text-xs text-red-500">{formErrors.discountValue}</p>}
        </div>
      </div>

      {/* Min Order & Max Discount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>الحد الأدنى للطلب (ر.س)</Label>
          <Input
            type="number"
            placeholder="0"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label>الحد الأقصى للخصم (ر.س)</Label>
          <Input
            type="number"
            placeholder="بدون حد"
            value={form.maxDiscount}
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            dir="ltr"
          />
        </div>
      </div>

      {/* Max Uses & Expiry */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>الحد الأقصى للاستخدامات</Label>
          <Input
            type="number"
            placeholder="غير محدود"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label>تاريخ الانتهاء</Label>
          <Input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'كوبونات نشطة', value: stats.activeCodes, icon: Tag, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
          { label: 'إجمالي الاستخدامات', value: stats.totalUsage, icon: Hash, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'إجمالي التوفير', value: `${stats.totalSavings} ر.س`, icon: DollarSign, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-xl font-bold mt-1 ${stat.color}`}>
                      {loading ? <Skeleton className="h-7 w-16" /> : stat.value}
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
                placeholder="بحث بالكود..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="pr-10 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="disabled">معطل</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setForm(emptyForm); setCreateOpen(true); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-9">
              <Plus className="h-4 w-4 ml-1" />
              إنشاء كوبون
            </Button>
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
                  <TableHead>الكود</TableHead>
                  <TableHead>الخصم</TableHead>
                  <TableHead>الحد الأدنى</TableHead>
                  <TableHead>الاستخدامات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الانتهاء</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : codes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Tag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">لا توجد كوبونات</p>
                        <p className="text-sm text-muted-foreground/70">ابدأ بإنشاء كوبون جديد</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  codes.map((code, index) => {
                    const sConf = statusConfig[getPromoStatus(code)] || statusConfig.disabled;
                    const SIcon = sConf.icon;
                    return (
                      <motion.tr
                        key={code.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-muted/50 border-b transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {code.code}
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6"
                              onClick={() => copyCode(code.code)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {code.discountType === 'PERCENTAGE' ? (
                              <span className="flex items-center gap-1">
                                <Percent className="h-3 w-3 text-primary" />
                                {code.discountValue}%
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-primary" />
                                {code.discountValue} ر.س
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {code.minOrderAmount > 0 ? `${code.minOrderAmount} ر.س` : '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className={`font-medium ${code.usedCount >= (code.maxUses || Infinity) ? 'text-red-600' : 'text-foreground'}`}>
                            {code.usedCount}
                          </span>
                          {code.maxUses && <span className="text-muted-foreground">/{code.maxUses}</span>}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sConf.color} ${sConf.bgColor}`}>
                            <SIcon className="h-3 w-3" />
                            {sConf.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {code.expiresAt ? formatDate(code.expiresAt) : 'بدون انتهاء'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => { setSelectedCode(code); setDetailOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => openEdit(code)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() => { setSelectedCode(code); setDeleteOpen(true); }}>
                              <Trash2 className="h-4 w-4" />
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

      {/* Cards (Mobile) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </CardContent></Card>
          ))
        ) : codes.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Tag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">لا توجد كوبونات</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          codes.map((code, index) => {
            const sConf = statusConfig[getPromoStatus(code)] || statusConfig.disabled;
            return (
              <motion.div key={code.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {code.code}
                        </code>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sConf.color} ${sConf.bgColor}`}>
                          {sConf.label}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => copyCode(code.code)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {code.discountType === 'PERCENTAGE' ? `${code.discountValue}%` : `${code.discountValue} ر.س`}
                      </span>
                      <span className="text-muted-foreground">
                        {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ''} استخدام
                      </span>
                    </div>
                    {code.expiresAt && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(code.expiresAt)}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
                        onClick={() => { setSelectedCode(code); setDetailOpen(true); }}>
                        <Eye className="h-3 w-3 ml-1" /> عرض
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8"
                        onClick={() => openEdit(code)}>
                        <Edit className="h-3 w-3 ml-1" /> تعديل
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8 text-red-500"
                        onClick={() => { setSelectedCode(code); setDeleteOpen(true); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
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

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setForm(emptyForm); setFormErrors({}); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              إنشاء كوبون جديد
            </DialogTitle>
            <DialogDescription className="text-right">أدخل بيانات كوبون الخصم الجديد</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleCreate} disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {submitting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              إنشاء الكوبون
            </Button>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setFormErrors({}); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              تعديل الكوبون
            </DialogTitle>
            <DialogDescription className="text-right">تعديل بيانات كوبون الخصم</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleEdit} disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {submitting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حفظ التعديلات
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              تفاصيل الكوبون
            </DialogTitle>
          </DialogHeader>
          {selectedCode && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3">
                <code className="text-xl font-bold bg-primary/10 text-primary px-4 py-2 rounded-lg">
                  {selectedCode.code}
                </code>
                <Button variant="outline" size="sm" onClick={() => copyCode(selectedCode.code)}>
                  <Copy className="h-4 w-4 ml-1" /> نسخ
                </Button>
              </div>
              {selectedCode.description && (
                <p className="text-sm text-muted-foreground">{selectedCode.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">نوع الخصم</p>
                  <p className="text-sm font-bold mt-1">
                    {selectedCode.discountType === 'PERCENTAGE' ? 'نسبة مئوية' : 'مبلغ ثابت'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">قيمة الخصم</p>
                  <p className="text-sm font-bold text-primary mt-1">
                    {selectedCode.discountType === 'PERCENTAGE'
                      ? `${selectedCode.discountValue}%`
                      : `${selectedCode.discountValue} ر.س`}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">الحد الأدنى للطلب</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedCode.minOrderAmount > 0 ? `${selectedCode.minOrderAmount} ر.س` : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">الحد الأقصى للخصم</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedCode.maxDiscount ? `${selectedCode.maxDiscount} ر.س` : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">الاستخدامات</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedCode.usedCount}{selectedCode.maxUses ? ` / ${selectedCode.maxUses}` : ''}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs text-muted-foreground">الانتهاء</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedCode.expiresAt ? formatDate(selectedCode.expiresAt) : 'بدون انتهاء'}
                  </p>
                </div>
              </div>
              {/* Usage progress */}
              {selectedCode.maxUses && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>نسبة الاستخدام</span>
                    <span>{Math.round((selectedCode.usedCount / selectedCode.maxUses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((selectedCode.usedCount / selectedCode.maxUses) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الكوبون</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الكوبون &quot;{selectedCode?.code}&quot؛؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
