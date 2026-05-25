'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Search,
  MessageSquare,
  Send,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { toast } from 'sonner';

// ============================================
// Types
// ============================================
interface ReviewItem {
  id: string;
  parcelId: string;
  reviewerId: string;
  captainId: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  reviewer?: {
    id: string;
    name: string;
    avatar: string | null;
  };
  captain?: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
  };
  parcel?: {
    id: string;
    trackingNumber: string;
  };
}

interface ReviewStats {
  total: number;
  averageRating: number;
  thisMonth: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// Helper Components
// ============================================
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const starSize = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ============================================
// Main Component
// ============================================
export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [stats, setStats] = useState<ReviewStats>({ total: 0, averageRating: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [captainSearch, setCaptainSearch] = useState('');

  // Reply dialog
  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // ============================================
  // Fetch reviews
  // ============================================
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);
      if (captainSearch) params.set('search', captainSearch);

      const res = await fetch(`/api/reviews?${params}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const json = await res.json();
      if (json.success) {
        setReviews(json.data || []);
        if (json.pagination) setPagination(json.pagination);
        if (json.stats) setStats(json.stats);
      }
    } catch {
      toast.error('حدث خطأ في جلب التقييمات');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, ratingFilter, captainSearch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ============================================
  // Open reply dialog
  // ============================================
  const openReply = (review: ReviewItem) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setReplyOpen(true);
  };

  // ============================================
  // Submit reply
  // ============================================
  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    setReplying(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const res = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم إرسال الرد بنجاح');
        setReplyOpen(false);
        fetchReviews();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء إرسال الرد');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setReplying(false);
    }
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div {...fadeInUp} transition={{ delay: 0.05 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي التقييمات</p>
                  <p className="text-xl font-bold text-primary mt-1">
                    {loading ? <Skeleton className="h-7 w-10" /> : stats.total}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">متوسط التقييم</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl font-bold text-amber-600">
                      {loading ? <Skeleton className="h-7 w-10" /> : stats.averageRating.toFixed(1)}
                    </p>
                    {!loading && <StarDisplay rating={Math.round(stats.averageRating)} />}
                  </div>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">تقييمات هذا الشهر</p>
                  <p className="text-xl font-bold text-emerald-600 mt-1">
                    {loading ? <Skeleton className="h-7 w-10" /> : stats.thisMonth}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث باسم الكابتن..."
                value={captainSearch}
                onChange={(e) => { setCaptainSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="pr-10 h-9"
              />
            </div>
            <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setPagination(p => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-40 h-9">
                <Star className="h-4 w-4 ml-2 text-amber-400" />
                <SelectValue placeholder="التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التقييمات</SelectItem>
                <SelectItem value="5">5 نجوم</SelectItem>
                <SelectItem value="4">4 نجوم</SelectItem>
                <SelectItem value="3">3 نجوم</SelectItem>
                <SelectItem value="2">نجمتان</SelectItem>
                <SelectItem value="1">نجمة واحدة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            قائمة التقييمات
            {!loading && (
              <Badge variant="secondary" className="text-xs mr-auto">
                {reviews.length} تقييم
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="bg-muted rounded-full p-6 mb-4">
                <Star className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-base font-medium">لا توجد تقييمات</p>
              <p className="text-sm mt-1">ستظهر التقييمات الجديدة هنا</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[600px]">
              <div className="divide-y divide-border/50">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-4 sm:px-6 py-5"
                  >
                    {/* Review Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {review.reviewer?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {review.reviewer?.name || 'مستخدم'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarDisplay rating={review.rating} />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!review.reply && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 shrink-0"
                          onClick={() => openReply(review)}
                        >
                          <Send className="h-3 w-3 ml-1" />
                          رد
                        </Button>
                      )}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-foreground/80 mb-3 pr-13">
                        {review.comment}
                      </p>
                    )}

                    {/* Captain Info & Parcel */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {review.captain && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>الكابتن: {review.captain.user.name}</span>
                        </div>
                      )}
                      {review.parcel && (
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3 w-3" />
                          <span className="font-mono">{review.parcel.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Captain Reply */}
                    {review.reply && (
                      <div className="mt-3 mr-13 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-700">
                            رد الكابتن
                          </span>
                          {review.repliedAt && (
                            <span className="text-[10px] text-emerald-600/70">
                              {formatDateTime(review.repliedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-emerald-800">{review.reply}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              الرد على التقييم
            </DialogTitle>
            <DialogDescription className="text-right">
              رد باسم الكابتن على تقييم العميل
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4 mt-2">
              {/* Original Review */}
              <div className="p-3 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {selectedReview.reviewer?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedReview.reviewer?.name || 'مستخدم'}</p>
                    <StarDisplay rating={selectedReview.rating} size="sm" />
                  </div>
                </div>
                {selectedReview.comment && (
                  <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
                )}
              </div>

              {/* Reply Textarea */}
              <div>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب رد الكابتن هنا..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <DialogFooter className="flex-row-reverse gap-2">
                <Button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {replying && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                  <Send className="h-4 w-4 ml-1" />
                  إرسال الرد
                </Button>
                <Button variant="outline" onClick={() => setReplyOpen(false)}>إلغاء</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
