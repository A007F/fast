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
  Plus,
  Search,
  Package,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  };
  parcel: {
    id: string;
    trackingNumber: string;
    status: string;
  } | null;
}

// ============================================
// تكوين الألوان
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

// ============================================
// المكون الرئيسي
// ============================================

interface CustomerSupportProps {
  onBack?: () => void;
}

export default function CustomerSupport({ onBack }: CustomerSupportProps) {
  const { toast } = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null;

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  // نموذج إنشاء تذكرة
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newParcelId, setNewParcelId] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  // إضافة رسالة إضافية
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [sendingAdditional, setSendingAdditional] = useState(false);

  // جلب التذاكر
  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/support', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTickets(json.data || []);
        }
      }
    } catch {
      // صامت
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // إنشاء تذكرة جديدة
  const handleCreateTicket = async () => {
    if (!token) return;
    if (!newSubject.trim() || !newDescription.trim()) {
      toast({ title: 'خطأ', description: 'العنوان والوصف مطلوبان', variant: 'destructive' });
      return;
    }
    try {
      setCreating(true);
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newSubject.trim(),
          description: newDescription.trim(),
          parcelId: newParcelId || null,
          priority: newPriority,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast({ title: 'تم بنجاح', description: 'تم إنشاء التذكرة بنجاح' });
          setCreateDialogOpen(false);
          setNewSubject('');
          setNewDescription('');
          setNewParcelId('');
          setNewPriority('MEDIUM');
          fetchTickets();
        }
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إنشاء التذكرة', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // إضافة رسالة إضافية
  const handleAddMessage = async (ticketId: string) => {
    if (!token || !additionalMessage.trim()) return;
    try {
      setSendingAdditional(true);
      const res = await fetch(`/api/support/${ticketId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: additionalMessage.trim() }),
      });
      if (res.ok) {
        toast({ title: 'تم بنجاح', description: 'تم إضافة الرسالة بنجاح' });
        setAdditionalMessage('');
        fetchTickets();
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ', variant: 'destructive' });
    } finally {
      setSendingAdditional(false);
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
    <div className="space-y-4">
      {/* العنوان وزر الإنشاء */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-xl p-2.5">
            <Headset className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">الدعم الفني</h2>
            <p className="text-sm text-muted-foreground">إدارة تذاكر الدعم والمساعدة</p>
          </div>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">فتح تذكرة جديدة</span>
              <span className="sm:hidden">تذكرة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                فتح تذكرة جديدة
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">العنوان</label>
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="موضوع المشكلة أو الاستفسار"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">الوصف التفصيلي</label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="اشرح المشكلة أو الاستفسار بالتفصيل..."
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">رقم الطرد (اختياري)</label>
                <Input
                  value={newParcelId}
                  onChange={(e) => setNewParcelId(e.target.value)}
                  placeholder="أدخل رقم التتبع للطرد المرتبط..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">الأولوية</label>
                <Select value={newPriority} onValueChange={setNewPriority}>
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

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={creating}
                className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              >
                {creating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جار الإنشاء...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    إرسال التذكرة
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* قائمة التذاكر */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <div className="bg-muted rounded-full p-8 mb-4">
            <Headset className="h-12 w-12 text-muted-foreground/40" />
          </div>
          <p className="text-base font-medium">لا توجد تذاكر</p>
          <p className="text-sm mt-1">اضغط على &quot;فتح تذكرة جديدة&quot; للتواصل مع الدعم</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tickets.map((ticket, i) => {
              const pConfig = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
              const sConfig = statusConfig[ticket.status] || statusConfig.OPEN;
              const StatusIcon = sConfig.icon;
              const isExpanded = expandedTicket === ticket.id;

              return (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="border-border/50 overflow-hidden">
                    <CardContent className="p-0">
                      {/* رأس التذكرة */}
                      <button
                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                        className="w-full flex items-center gap-3 p-4 text-right hover:bg-muted/30 transition-colors"
                      >
                        <div className={`shrink-0 h-10 w-10 rounded-full ${sConfig.bgColor} border ${sConfig.borderColor} flex items-center justify-center`}>
                          <StatusIcon className={`h-5 w-5 ${sConfig.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {ticket.subject}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant="outline" className={`text-[10px] h-5 ${pConfig.bgColor} ${pConfig.borderColor} ${pConfig.color}`}>
                                {pConfig.label}
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] h-5 ${sConfig.bgColor} ${sConfig.borderColor} ${sConfig.color}`}>
                                {sConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(ticket.createdAt)}
                            {ticket.parcel && ` · طرد ${ticket.parcel.trackingNumber}`}
                          </p>
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </button>

                      {/* تفاصيل موسعة */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border/50 p-4 space-y-4">
                              {/* رسالة العميل */}
                              <div className="p-3 rounded-xl bg-muted/50 border text-sm whitespace-pre-wrap">
                                <p className="text-muted-foreground">{ticket.description}</p>
                              </div>

                              {/* رد الدعم */}
                              {ticket.response && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Headset className="h-4 w-4 text-emerald-600" />
                                    رد الدعم
                                    {ticket.respondedAt && (
                                      <span className="text-xs text-muted-foreground font-normal">
                                        {formatDate(ticket.respondedAt)}
                                      </span>
                                    )}
                                  </h4>
                                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm whitespace-pre-wrap">
                                    {ticket.response}
                                  </div>
                                </div>
                              )}

                              {!ticket.response && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                                  <Clock className="h-4 w-4" />
                                  <p>بانتظار رد فريق الدعم...</p>
                                </div>
                              )}

                              {/* إضافة رسالة إضافية */}
                              {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">إضافة رسالة إضافية</label>
                                  <div className="flex gap-2">
                                    <Input
                                      value={additionalMessage}
                                      onChange={(e) => setAdditionalMessage(e.target.value)}
                                      placeholder="أضف تفاصيل إضافية..."
                                      className="flex-1"
                                    />
                                    <Button
                                      size="icon"
                                      onClick={() => handleAddMessage(ticket.id)}
                                      disabled={sendingAdditional || !additionalMessage.trim()}
                                      className="bg-primary hover:bg-primary/90 shrink-0"
                                    >
                                      {sendingAdditional ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                      ) : (
                                        <Send className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
