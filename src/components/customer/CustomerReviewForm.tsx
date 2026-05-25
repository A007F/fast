'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ============================================
// Props
// ============================================
interface CustomerReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcelId: string;
  captainId: string;
  captainName: string;
  onSuccess?: () => void;
}

// ============================================
// Main Component
// ============================================
export default function CustomerReviewForm({
  open,
  onOpenChange,
  parcelId,
  captainId,
  captainName,
  onSuccess,
}: CustomerReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setRating(0);
      setHoverRating(0);
      setComment('');
    }
    onOpenChange(isOpen);
  };

  // ============================================
  // Submit review
  // ============================================
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('الرجاء اختيار تقييم');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const body: Record<string, unknown> = {
        parcelId,
        captainId,
        rating,
      };
      if (comment.trim()) body.comment = comment.trim();

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم إرسال تقييمك بنجاح! شكراً لك');
        handleOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء إرسال التقييم');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Star labels
  // ============================================
  const starLabels: Record<number, string> = {
    1: 'سيء',
    2: 'مقبول',
    3: 'جيد',
    4: 'جيد جداً',
    5: 'ممتاز',
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            تقييم التوصيل
          </DialogTitle>
          <DialogDescription className="text-right">
            قيّم خدمة الكابتن <span className="font-semibold text-foreground">{captainName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Star Rating */}
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="flex items-center gap-2"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none p-1"
                >
                  <Star
                    className={`h-10 w-10 transition-colors duration-200 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </motion.button>
              ))}
            </motion.div>
            {(hoverRating || rating) > 0 && (
              <motion.p
                key={hoverRating || rating}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-medium text-amber-600"
              >
                {starLabels[hoverRating || rating]}
              </motion.p>
            )}
            {rating === 0 && (
              <p className="text-xs text-muted-foreground">اضغط على النجوم للتقييم</p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">أضف تعليقاً (اختياري)</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا رأيك في الخدمة..."
              rows={3}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-left" dir="ltr">
              {comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row-reverse gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جار الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 ml-1" />
                إرسال التقييم
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
