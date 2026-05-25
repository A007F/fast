'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headset,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  Send,
  Search,
  User,
  Package,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { useToast } from '@/hooks/use-toast';

// ============================================
// أنواع البيانات
// ============================================

interface SupportTicket {
  id: string;
  userId: string;
  parcelId: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  response: string | null;
  respondedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    avatar?: string | null;
  };
  parcel: {
    id: string;
    trackingNumber: string;
    status: string;
    receiverName?: string;
    senderAddress?: string;
    receiverAddress?: string;
  } | null;
}

interface TicketStats {
  total: number;
  byStatus: { OPEN: number; IN_PROGRESS: number; RESOLVED: number; CLOSED: number };
  byPriority: { LOW: number; MEDIUM: number; HIGH: number; URGENT: number };
  avgResponseMinutes: number;
}

// ============================================
// تكوين الألوان والأيقونات
// ============================================

const priorityConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  URGENT: { label: 'عاجل', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
  HIGH: { label: 'عالي', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
  MEDIUM: { label: 'متوسط', color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
  LOW: { label: 'منخفض', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300' },
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof CheckCircle }> = {
  OPEN: { label: 'مفتوحة', color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300', icon: AlertCircle },
  IN_PROGRESS: { label: 'قيد المعالجة', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-300', icon: Clock },
  RESOLVED: { label: 'محلولة', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-300', icon: CheckCircle },
  CLOSED: { label: 'مغلقة', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-300', icon: CheckCircle },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// ============================================
// المكون الرئيسي
// ============================================

export default function AdminSupport() {
  const { toast } = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null;

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // الفلاتر
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // تفاصيل التذكرة
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // نموذج الرد
  const [responseText, setResponseText] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [ticketPriority, setTicketPriority] = useState('');
  const [sending, setSending] = useState(false);

  // جلب الإحصائيات
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setStatsLoading(true);
      const res = await fetch('/api/support/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStats(json.data);
      }
    } catch {
      // صامت
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  // جلب التذاكر
  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (priorityFilter !== 'ALL') params.set('priority', priorityFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/support?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTickets(json.data || []);
          setTotalPages(json.pagination?.totalPages || 1);
        }
      }
    } catch {
      // صامت
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchStats, fetchTickets]);

  // فتح تفاصيل التذكرة
  const openDetail = async (ticket: SupportTicket) => {
    try {
      const res = await fetch(`/api/support/${ticket.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSelectedTicket(json.data);
          setTicketStatus(json.data.status);
          setTicketPriority(json.data.priority);
          setResponseText(json.data.response || '');
          setDetailOpen(true);
        }
      }
    } catch {
      setSelectedTicket(ticket);
      setTicketStatus(ticket.status);
      setTicketPriority(ticket.priority);
      setResponseText(ticket.response || '');
      setDetailOpen(true);
    }
  };

  // إرسال الرد
  const handleRespond = async () => {
    if (!token || !selectedTicket) return;
    if (!responseText.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء كتابة الرد', variant: 'destructive' });
      return;
    }
    try {
      setSending(true);
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: responseText.trim(),
          status: ticketStatus,
          priority: ticketPriority,
        }),
      });
      if (res.ok) {
        toast({ title: 'تم بنجاح', description: 'تم إرسال الرد وتحديث التذكرة' });
        setDetailOpen(false);
        fetchTickets();
        fetchStats();
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إرسال الرد', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  // تنسيق التاريخ
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
    <div className="space-y-6">
      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : [
              { label: 'إجمالي التذاكر', value: stats?.total || 0, icon: MessageSquare, color: 'text-primary', bgColor: 'bg-primary/10' },
              { label: 'مفتوحة', value: stats?.byStatus.OPEN || 0, icon: AlertCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
              { label: 'قيد المعالجة', value: stats?.byStatus.IN_PROGRESS || 0, icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50' },
              { label: 'محلولة', value: stats?.byStatus.RESOLVED || 0, icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
            ].map((stat, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {/* متوسط وقت الاستجابة */}
      {stats && (
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <Clock className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-700">
              متوسط وقت الاستجابة: <span className="font-bold">{stats.avgResponseMinutes}</span> دقيقة
            </p>
          </div>
        </motion.div>
      )}

      {/* شريط الفلاتر */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في التذاكر..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pr-10 h-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">جميع الحالات</SelectItem>
                <SelectItem value="OPEN">مفتوحة</SelectItem>
                <SelectItem value="IN_PROGRESS">قيد المعالجة</SelectItem>
                <SelectItem value="RESOLVED">محلولة</SelectItem>
                <SelectItem value="CLOSED">مغلقة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">جميع الأولويات</SelectItem>
                <SelectItem value="URGENT">عاجل</SelectItem>
                <SelectItem value="HIGH">عالي</SelectItem>
                <SelectItem value="MEDIUM">متوسط</SelectItem>
                <SelectItem value="LOW">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* قائمة التذاكر */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Headset className="h-5 w-5 text-primary" />
            قائمة التذاكر
            {!loading && (
              <Badge variant="secondary" className="text-xs mr-auto">
                {tickets.length} تذكرة
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Headset className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium">لا توجد تذاكر</p>
              <p className="text-sm mt-1">ستظهر التذاكر الجديدة هنا</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border/50">
                {tickets.map((ticket, i) => {
                  const pConfig = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
                  const sConfig = statusConfig[ticket.status] || statusConfig.OPEN;
                  const StatusIcon = sConfig.icon;

                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => openDetail(ticket)}
                      className="group flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      {/* أيقونة الحالة */}
                      <div className={`shrink-0 h-10 w-10 rounded-full ${sConfig.bgColor} border ${sConfig.borderColor} flex items-center justify-center`}>
                        <StatusIcon className={`h-5 w-5 ${sConfig.color}`} />
                      </div>

                      {/* المحتوى */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {ticket.subject}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {ticket.user.name} · {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className={`text-[10px] h-5 ${pConfig.bgColor} ${pConfig.borderColor} ${pConfig.color}`}>
                              {pConfig.label}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] h-5 ${sConfig.bgColor} ${sConfig.borderColor} ${sConfig.color}`}>
                              {sConfig.label}
                            </Badge>
                          </div>
                        </div>

                        {/* معاينة الوصف */}
                        <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                          {ticket.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* ترقيم الصفحات */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            التالي
          </Button>
        </div>
      )}

      {/* حوار تفاصيل التذكرة */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Headset className="h-5 w-5 text-primary" />
              تفاصيل التذكرة
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="flex-1 overflow-y-auto space-y-4 mt-2">
              {/* معلومات المستخدم والطرد */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">العميل</p>
                    <p className="text-sm font-semibold">{selectedTicket.user.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedTicket.user.phone}</p>
                  </div>
                </div>
                {selectedTicket.parcel && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">الطرد المرتبط</p>
                      <p className="text-sm font-semibold">{selectedTicket.parcel.trackingNumber}</p>
                      <p className="text-xs text-muted-foreground">{selectedTicket.parcel.status}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* الحالة والأولوية */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${(statusConfig[selectedTicket.status] || statusConfig.OPEN).bgColor} ${(statusConfig[selectedTicket.status] || statusConfig.OPEN).color} ${(statusConfig[selectedTicket.status] || statusConfig.OPEN).borderColor} border`}>
                  {(statusConfig[selectedTicket.status] || statusConfig.OPEN).label}
                </Badge>
                <Badge className={`${(priorityConfig[selectedTicket.priority] || priorityConfig.MEDIUM).bgColor} ${(priorityConfig[selectedTicket.priority] || priorityConfig.MEDIUM).color} ${(priorityConfig[selectedTicket.priority] || priorityConfig.MEDIUM).borderColor} border`}>
                  {(priorityConfig[selectedTicket.priority] || priorityConfig.MEDIUM).label}
                </Badge>
                <span className="text-xs text-muted-foreground mr-auto">
                  {formatDate(selectedTicket.createdAt)}
                </span>
              </div>

              <Separator />

              {/* رسالة العميل */}
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  رسالة العميل
                </h4>
                <div className="p-3 rounded-xl bg-muted/50 border text-sm whitespace-pre-wrap">
                  <p className="font-medium mb-1">{selectedTicket.subject}</p>
                  <p className="text-muted-foreground">{selectedTicket.description}</p>
                </div>
              </div>

              {/* رد المدير السابق */}
              {selectedTicket.response && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Headset className="h-4 w-4 text-emerald-600" />
                    رد الدعم
                    {selectedTicket.respondedAt && (
                      <span className="text-xs text-muted-foreground font-normal">
                        {formatDate(selectedTicket.respondedAt)}
                      </span>
                    )}
                  </h4>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm whitespace-pre-wrap">
                    {selectedTicket.response}
                  </div>
                </div>
              )}

              <Separator />

              {/* تحديث الحالة والأولوية */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">تحديث الحالة</label>
                  <Select value={ticketStatus} onValueChange={setTicketStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">مفتوحة</SelectItem>
                      <SelectItem value="IN_PROGRESS">قيد المعالجة</SelectItem>
                      <SelectItem value="RESOLVED">محلولة</SelectItem>
                      <SelectItem value="CLOSED">مغلقة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">الأولوية</label>
                  <Select value={ticketPriority} onValueChange={setTicketPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">منخفض</SelectItem>
                      <SelectItem value="MEDIUM">متوسط</SelectItem>
                      <SelectItem value="HIGH">عالي</SelectItem>
                      <SelectItem value="URGENT">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* منطقة الرد */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">الرد على التذكرة</label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* زر الإرسال */}
              <Button
                onClick={handleRespond}
                disabled={sending}
                className="w-full gap-2 bg-primary hover:bg-primary/90"
              >
                {sending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جار الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    إرسال الرد
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
