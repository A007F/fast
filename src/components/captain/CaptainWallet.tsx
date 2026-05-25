'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Star,
  Gift,
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Banknote,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
// Types
// ============================================
interface WalletInfo {
  id: string;
  balance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  pendingAmount: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  referenceId: string | null;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// Config
// ============================================
const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string; amountColor: string }> = {
  EARNING: { label: 'أرباح', icon: ArrowUpCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-50', amountColor: 'text-emerald-600' },
  WITHDRAWAL: { label: 'سحب', icon: ArrowDownCircle, color: 'text-red-600', bgColor: 'bg-red-50', amountColor: 'text-red-600' },
  BONUS: { label: 'مكافأة', icon: Star, color: 'text-amber-600', bgColor: 'bg-amber-50', amountColor: 'text-amber-600' },
  ADJUSTMENT: { label: 'تعديل', icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50', amountColor: 'text-blue-600' },
};

const statusBadge: Record<string, { label: string; color: string; bgColor: string }> = {
  COMPLETED: { label: 'مكتمل', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  PENDING: { label: 'معلق', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  FAILED: { label: 'فاشل', color: 'text-red-700', bgColor: 'bg-red-100' },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const CAPTAIN_ID = 'cmpjwmui00004kjlwle7k39ml';

// ============================================
// Main Component
// ============================================
export default function CaptainWallet() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1, limit: 20, total: 0, totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  // Withdraw dialog
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // ============================================
  // Fetch wallet
  // ============================================
  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wallet?captainId=${CAPTAIN_ID}`);
      const json = await res.json();
      if (json.success && json.data) {
        setWallet(json.data);
      }
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // Fetch transactions
  // ============================================
  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
      });
      const res = await fetch(`/api/wallet/transactions?captainId=${CAPTAIN_ID}&${params}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch {
      // Silent
    } finally {
      setTxLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ============================================
  // Withdraw
  // ============================================
  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }
    if (wallet && amount > wallet.balance) {
      toast.error('المبلغ أكبر من الرصيد المتاح');
      return;
    }
    if (amount < 10) {
      toast.error('الحد الأدنى للسحب 10 ر.س');
      return;
    }

    setWithdrawing(true);
    try {
      const token = localStorage.getItem('saree3_token');
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ captainId: CAPTAIN_ID, amount }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('تم تقديم طلب السحب بنجاح');
        setWithdrawOpen(false);
        setWithdrawAmount('');
        fetchWallet();
        fetchTransactions();
      } else {
        toast.error(json.error || 'حدث خطأ أثناء السحب');
      }
    } catch {
      toast.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setWithdrawing(false);
    }
  };

  // ============================================
  // Format helpers
  // ============================================
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-5 pb-6">
      {/* Main Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gradient-to-bl from-emerald-500 to-emerald-700 border-0 text-white overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-200" />
                  <span className="text-sm text-emerald-200">محفظتي</span>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  <TrendingUp className="h-3 w-3 ml-1" />
                  نشط
                </Badge>
              </div>
              {loading ? (
                <Skeleton className="h-10 w-40 bg-white/20" />
              ) : (
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-4xl font-bold">
                    {wallet?.balance?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-lg text-emerald-200">ر.س</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/15 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-200">إجمالي الأرباح</p>
                  <p className="text-base font-bold">
                    {loading ? '...' : `${wallet?.totalEarnings?.toFixed(2) || '0.00'} ر.س`}
                  </p>
                </div>
                <div className="bg-white/15 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-200">إجمالي المسحوبات</p>
                  <p className="text-base font-bold">
                    {loading ? '...' : `${wallet?.totalWithdrawn?.toFixed(2) || '0.00'} ر.س`}
                  </p>
                </div>
              </div>
              {wallet && wallet.pendingAmount > 0 && (
                <div className="mt-3 bg-amber-400/20 rounded-lg p-2 flex items-center justify-between">
                  <span className="text-xs text-amber-100">مبالغ معلقة</span>
                  <span className="text-sm font-bold text-amber-200">{wallet.pendingAmount.toFixed(2)} ر.س</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdraw Button */}
      <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
        <Button
          onClick={() => setWithdrawOpen(true)}
          className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          disabled={loading || !wallet || wallet.balance < 10}
        >
          <Banknote className="h-5 w-5" />
          سحب الأموال
        </Button>
      </motion.div>

      {/* Transactions */}
      <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              المعاملات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {txLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-14" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <div className="bg-muted rounded-full p-4 mb-3">
                  <CreditCard className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium">لا توجد معاملات</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border/50">
                {transactions.map((tx) => {
                  const tConf = typeConfig[tx.type] || typeConfig.ADJUSTMENT;
                  const sConf = statusBadge[tx.status] || statusBadge.COMPLETED;
                  const TIcon = tConf.icon;
                  const isPositive = tx.type === 'EARNING' || tx.type === 'BONUS';

                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${tConf.bgColor} flex items-center justify-center`}>
                          {tx.type === 'BONUS' ? (
                            <Gift className="h-5 w-5 text-amber-500" />
                          ) : (
                            <TIcon className={`h-5 w-5 ${tConf.color}`} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tConf.label}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {tx.description || '—'} · {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left flex items-center gap-2">
                        <div>
                          <p className={`text-sm font-bold ${tConf.amountColor}`}>
                            {isPositive ? '+' : '-'}{tx.amount.toFixed(2)} ر.س
                          </p>
                          <Badge variant="outline" className={`text-[9px] h-4 ${sConf.color} ${sConf.bgColor}`}>
                            {sConf.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Transaction Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                  <ChevronRight className="h-4 w-4 ml-1" /> السابق
                </Button>
                <span className="text-sm text-muted-foreground">
                  {pagination.page} من {pagination.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                  التالي <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={(open) => { setWithdrawOpen(open); if (!open) setWithdrawAmount(''); }}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              سحب الأموال
            </DialogTitle>
            <DialogDescription className="text-right">
              الرصيد المتاح: <span className="font-bold text-foreground">{wallet?.balance?.toFixed(2)} ر.س</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quick amounts */}
            <div className="grid grid-cols-3 gap-2">
              {wallet && [
                { label: '50 ر.س', value: 50 },
                { label: '100 ر.س', value: 100 },
                { label: '500 ر.س', value: 500 },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={withdrawAmount === option.value.toString() ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs"
                  disabled={option.value > wallet.balance}
                  onClick={() => setWithdrawAmount(option.value.toString())}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <Label>المبلغ (ر.س)</Label>
              <Input
                type="number"
                placeholder="أدخل المبلغ"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                dir="ltr"
                className="text-lg text-center font-bold"
                min="10"
                max={wallet?.balance || 0}
              />
              <p className="text-xs text-muted-foreground text-center">
                الحد الأدنى: 10 ر.س · الحد الأقصى: {wallet?.balance?.toFixed(2)} ر.س
              </p>
            </div>
          </div>

          <DialogFooter className="flex-row-reverse gap-2">
            <Button
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) < 10}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
            >
              {withdrawing ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جار المعالجة...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 ml-1" />
                  تأكيد السحب
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
