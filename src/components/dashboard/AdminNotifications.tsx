'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Plus,
  Send,
  Package,
  CreditCard,
  Megaphone,
  Info,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  Users,
  Circle,
  Eye,
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    role: string;
  };
}

const typeConfig: Record<string, { icon: typeof Package; color: string; bgColor: string; borderColor: string; label: string }> = {
  ORDER_UPDATE: { icon: Package, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', label: 'تحديث طلب' },
  PAYMENT: { icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', label: 'دفعة' },
  PROMOTION: { icon: Megaphone, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', label: 'عرض خاص' },
  INFO: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', label: 'معلومة' },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; phone: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New notification form
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newType, setNewType] = useState('INFO');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [sendTarget, setSendTarget] = useState<'single' | 'all_customers' | 'all_captains' | 'all'>('single');
  const [sending, setSending] = useState(false);

  const { toast } = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (filterType !== 'ALL') params.set('type', filterType);

      const res = await fetch(`/api/notifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data || []);
          setTotalPages(json.pagination?.totalPages || 1);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [token, page, filterType]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/captains?limit=100');
      if (res.ok) {
        const json = await res.json();
        const captains = (json.data || []).map((c: { user: { id: string; name: string; phone: string; role: string } }) => c.user);
        // Also fetch parcels to get senders
        const res2 = await fetch('/api/parcels?limit=100');
        if (res2.ok) {
          const json2 = await res2.json();
          const senders = new Map<string, { id: string; name: string; phone: string; role: string }>();
          (json2.data || []).forEach((p: { sender: { id: string; name: string; phone: string } }) => {
            if (p.sender && !senders.has(p.sender.id)) {
              senders.set(p.sender.id, { ...p.sender, role: 'CUSTOMER' });
            }
          });
          setAllUsers([...captains, ...Array.from(senders.values())]);
        }
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (dialogOpen) {
      fetchUsers();
    }
  }, [dialogOpen, fetchUsers]);

  const filteredNotifications = notifications.filter((n) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  const handleSendNotification = async () => {
    if (!token) return;

    if (sendTarget === 'single' && !selectedUserId) {
      toast({ title: 'خطأ', description: 'الرجاء اختيار المستخدم المستهدف', variant: 'destructive' });
      return;
    }
    if (!newTitle || !newBody) {
      toast({ title: 'خطأ', description: 'الرجاء تعبئة العنوان والمحتوى', variant: 'destructive' });
      return;
    }

    try {
      setSending(true);

      if (sendTarget === 'single') {
        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: selectedUserId,
            title: newTitle,
            body: newBody,
            type: newType,
          }),
        });
        if (res.ok) {
          toast({ title: 'تم بنجاح', description: 'تم إرسال الإشعار بنجاح' });
          setDialogOpen(false);
          resetForm();
          fetchNotifications();
        }
      } else {
        // Bulk send
        let targetUsers = allUsers;
        if (sendTarget === 'all_customers') {
          targetUsers = allUsers.filter((u) => u.role === 'CUSTOMER');
        } else if (sendTarget === 'all_captains') {
          targetUsers = allUsers.filter((u) => u.role === 'CAPTAIN');
        }

        let sentCount = 0;
        for (const user of targetUsers) {
          const res = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              title: newTitle,
              body: newBody,
              type: newType,
            }),
          });
          if (res.ok) sentCount++;
        }

        toast({
          title: 'تم بنجاح',
          description: `تم إرسال الإشعار إلى ${sentCount} مستخدم`,
        });
        setDialogOpen(false);
        resetForm();
        fetchNotifications();
      }
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء إرسال الإشعار', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewBody('');
    setNewType('INFO');
    setSelectedUserId('');
    setSendTarget('single');
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Silent fail
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({ title: 'تم الحذف', description: 'تم حذف الإشعار بنجاح' });
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الإشعارات', value: notifications.length, icon: Bell, color: 'text-primary', bgColor: 'bg-primary/10' },
          { label: 'غير مقروءة', value: notifications.filter((n) => !n.isRead).length, icon: Circle, color: 'text-amber-600', bgColor: 'bg-amber-50' },
          { label: 'تحديثات طلبات', value: notifications.filter((n) => n.type === 'ORDER_UPDATE').length, icon: Package, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
          { label: 'إشعارات دفع', value: notifications.filter((n) => n.type === 'PAYMENT').length, icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50' },
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

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الإشعارات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36 h-9">
              <Filter className="h-4 w-4 ml-2" />
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">الكل</SelectItem>
              <SelectItem value="ORDER_UPDATE">تحديث طلب</SelectItem>
              <SelectItem value="PAYMENT">دفعة</SelectItem>
              <SelectItem value="PROMOTION">عرض خاص</SelectItem>
              <SelectItem value="INFO">معلومة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              إرسال إشعار
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                إرسال إشعار جديد
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Target */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">المستهدفون</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'single' as const, label: 'مستخدم محدد', icon: Users },
                    { value: 'all_customers' as const, label: 'جميع العملاء', icon: Package },
                    { value: 'all_captains' as const, label: 'جميع الكبائن', icon: Megaphone },
                    { value: 'all' as const, label: 'جميع المستخدمين', icon: Bell },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSendTarget(opt.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        sendTarget === opt.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      <opt.icon className="h-4 w-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {sendTarget === 'single' && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">اختر المستخدم</label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مستخدم..." />
                    </SelectTrigger>
                    <SelectContent>
                      {allUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role === 'CAPTAIN' ? 'كابتن' : 'عميل'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">نوع الإشعار</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">معلومة</SelectItem>
                    <SelectItem value="ORDER_UPDATE">تحديث طلب</SelectItem>
                    <SelectItem value="PAYMENT">دفعة</SelectItem>
                    <SelectItem value="PROMOTION">عرض خاص</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">العنوان</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="عنوان الإشعار"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">المحتوى</label>
                <Textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="نص الإشعار..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleSendNotification} disabled={sending} className="gap-2 bg-primary hover:bg-primary/90">
                {sending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جار الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    إرسال
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">سجل الإشعارات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Bell className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium">لا توجد إشعارات</p>
              <p className="text-sm mt-1">ابدأ بإرسال إشعار جديد</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border/50">
                {filteredNotifications.map((notification, i) => {
                  const config = typeConfig[notification.type] || typeConfig.INFO;
                  const Icon = config.icon;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group flex gap-3 px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors ${
                        !notification.isRead ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className={`shrink-0 h-11 w-11 rounded-full ${config.bgColor} border ${config.borderColor} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm font-semibold ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.body}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="outline" className="text-[10px] h-5 border-border/50">
                              {config.label}
                            </Badge>
                            {!notification.isRead && (
                              <Circle className="h-2 w-2 fill-primary text-primary" />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground/70">
                            {new Date(notification.createdAt).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-7 px-2 text-xs text-primary"
                              >
                                <Eye className="h-3.5 w-3.5 ml-1" />
                                قراءة
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 ml-1" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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
    </div>
  );
}
