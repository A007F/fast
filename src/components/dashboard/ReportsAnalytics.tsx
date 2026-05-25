'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  Clock,
  Banknote,
  DollarSign,
  Users,
  TrendingUp,
  Star,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ===== Types =====
interface ReportsAnalyticsProps {
  onBack: () => void;
}

type PeriodType = '7d' | '30d' | '90d' | '1y';

interface OverviewData {
  totalParcels: number;
  delivered: number;
  deliveryRate: number;
  avgDeliveryMinutes: number;
  totalRevenue: number;
  codCollected: number;
  activeCaptains: number;
  statusDistribution: { name: string; value: number; color: string }[];
  parcelsPerDay: { date: string; label: string; parcels: number }[];
}

interface RevenueData {
  totalRevenue: number;
  deliveryFeesRevenue: number;
  platformFees: number;
  captainEarnings: number;
  codCollected: number;
  dailyRevenue: { date: string; label: string; revenue: number; captainEarnings: number; platformFees: number }[];
  topRevenueDays: { date: string; revenue: number; captainEarnings: number; platformFees: number }[];
}

interface PerformanceData {
  avgDeliveryMinutes: number;
  deliveryRate: number;
  onTimeRate: number;
  cancelRate: number;
  statusDistribution: { name: string; value: number; color: string }[];
  captainPerformance: { name: string; deliveries: number; avgRating: number; avgTime: number }[];
  dailyPerformance: { date: string; label: string; delivered: number; cancelled: number; total: number }[];
}

interface CaptainData {
  totalCaptains: number;
  onlineCaptains: number;
  avgRating: number;
  totalDeliveriesPeriod: number;
  rankings: {
    id: string;
    name: string;
    isOnline: boolean;
    rating: number;
    totalDeliveries: number;
    periodDeliveries: number;
    periodRevenue: number;
    avgDeliveryMinutes: number;
    vehicleType: string;
  }[];
  top10Chart: { rank: number; name: string; deliveries: number; rating: number; revenue: number }[];
}

// ===== Constants =====
const periods: { key: PeriodType; label: string }[] = [
  { key: '7d', label: '7 أيام' },
  { key: '30d', label: '30 يوم' },
  { key: '90d', label: '90 يوم' },
  { key: '1y', label: 'سنة' },
];

const CHART_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#f43f5e', '#3b82f6'];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ===== Helpers =====
const formatCurrency = (val: number) => `${val.toLocaleString('ar-SA')} ر.س`;
const formatNumber = (val: number) => val.toLocaleString('ar-SA');
const formatMinutes = (mins: number) => {
  if (mins < 60) return `${mins} دقيقة`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h} س ${m} د` : `${h} ساعة`;
};

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid hsl(var(--border))',
  backgroundColor: 'hsl(var(--background))',
  fontSize: '12px',
  direction: 'rtl' as const,
};

// ===== Component =====
export default function ReportsAnalytics({ onBack }: ReportsAnalyticsProps) {
  const [period, setPeriod] = useState<PeriodType>('7d');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [captains, setCaptains] = useState<CaptainData | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, perfRes, captainsRes] = await Promise.all([
        fetch(`/api/reports?type=overview&period=${period}`),
        fetch(`/api/reports?type=revenue&period=${period}`),
        fetch(`/api/reports?type=performance&period=${period}`),
        fetch(`/api/reports?type=captains&period=${period}`),
      ]);

      const [overviewJson, revenueJson, perfJson, captainsJson] = await Promise.all([
        overviewRes.json(),
        revenueRes.json(),
        perfRes.json(),
        captainsRes.json(),
      ]);

      if (overviewJson.success) setOverview(overviewJson.data);
      if (revenueJson.success) setRevenue(revenueJson.data);
      if (perfJson.success) setPerformance(perfJson.data);
      if (captainsJson.success) setCaptains(captainsJson.data);
    } catch (err) {
      console.error('خطأ في جلب التقارير:', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            التقارير والتحليلات
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            إحصائيات شاملة لأداء المنصة
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
          {periods.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant={period === p.key ? 'default' : 'ghost'}
              onClick={() => setPeriod(p.key)}
              className="text-xs rounded-lg"
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" dir="rtl" className="space-y-6">
        <TabsList className="bg-muted/50 h-auto p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الإيرادات
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الأداء
          </TabsTrigger>
          <TabsTrigger value="captains" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            الكبائن
          </TabsTrigger>
        </TabsList>

        {/* ===== Tab 1: Overview ===== */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <OverviewSkeleton />
          ) : overview ? (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                  icon={Package}
                  label="إجمالي الطرود"
                  value={formatNumber(overview.totalParcels)}
                  color="bg-primary/10 text-primary"
                  index={0}
                />
                <StatCard
                  icon={TrendingUp}
                  label="نسبة التسليم"
                  value={`${overview.deliveryRate}%`}
                  color="bg-emerald-500/10 text-emerald-600"
                  index={1}
                  trend={overview.deliveryRate >= 70 ? 'up' : 'down'}
                />
                <StatCard
                  icon={Clock}
                  label="متوسط وقت التوصيل"
                  value={formatMinutes(overview.avgDeliveryMinutes)}
                  color="bg-teal-500/10 text-teal-600"
                  index={2}
                />
                <StatCard
                  icon={Banknote}
                  label="إجمالي الإيرادات"
                  value={formatCurrency(overview.totalRevenue)}
                  color="bg-amber-500/10 text-amber-600"
                  index={3}
                />
                <StatCard
                  icon={DollarSign}
                  label="الدفع عند الاستلام"
                  value={formatCurrency(overview.codCollected)}
                  color="bg-rose-500/10 text-rose-600"
                  index={4}
                />
                <StatCard
                  icon={Users}
                  label="كبائن نشط"
                  value={formatNumber(overview.activeCaptains)}
                  color="bg-blue-500/10 text-blue-600"
                  index={5}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart - Status Distribution */}
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">توزيع حالات الطرود</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {overview.statusDistribution.length > 0 ? (
                        <div className="flex flex-col items-center gap-4">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={overview.statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {overview.statusDistribution.map((entry, index) => (
                                  <Cell key={index} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap justify-center gap-3">
                            {overview.statusDistribution.map((entry, index) => (
                              <div key={index} className="flex items-center gap-1.5">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                          لا توجد بيانات
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Bar Chart - Parcels Per Day */}
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">الطرود اليومية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={overview.parcelsPerDay.slice(-14)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Bar dataKey="parcels" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} name="طرود" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* ===== Tab 2: Revenue ===== */}
        <TabsContent value="revenue" className="space-y-6">
          {loading ? (
            <RevenueSkeleton />
          ) : revenue ? (
            <>
              {/* Main Revenue Card */}
              <motion.div {...fadeInUp} transition={{ duration: 0.3 }}>
                <Card className="bg-gradient-to-l from-emerald-600 to-teal-600 border-0 text-white overflow-hidden">
                  <CardContent className="p-6 relative">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-10 -translate-y-10" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-8 translate-y-8" />
                    <div className="relative z-10">
                      <p className="text-emerald-100 text-sm">إجمالي الإيرادات</p>
                      <p className="text-3xl sm:text-4xl font-bold mt-2">{formatCurrency(revenue.totalRevenue)}</p>
                      <p className="text-emerald-200 text-xs mt-2">للفترة المحددة</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sub Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Banknote className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">إيرادات التوصيل</p>
                          <p className="text-lg font-bold">{formatCurrency(revenue.deliveryFeesRevenue)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.2 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">رسوم المنصة</p>
                          <p className="text-lg font-bold">{formatCurrency(revenue.platformFees)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.3 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">حصص الكبائن</p>
                          <p className="text-lg font-bold">{formatCurrency(revenue.captainEarnings)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Area Chart + Top Days */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.4 }} className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">اتجاه الإيرادات اليومية</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenue.dailyRevenue} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(revenue.dailyRevenue.length / 7))} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value)]} />
                          <Legend />
                          <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#colorRev)" strokeWidth={2} name="الإيرادات" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.5 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">أعلى 5 أيام إيرادات</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {revenue.topRevenueDays.length > 0 ? (
                        revenue.topRevenueDays.map((day, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-sm font-bold">
                                {i + 1}
                              </div>
                              <span className="text-sm text-muted-foreground">{day.date}</span>
                            </div>
                            <span className="text-sm font-semibold">{formatCurrency(day.revenue)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* ===== Tab 3: Performance ===== */}
        <TabsContent value="performance" className="space-y-6">
          {loading ? (
            <PerformanceSkeleton />
          ) : performance ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">متوسط وقت التوصيل</p>
                          <p className="text-xl font-bold">{formatMinutes(performance.avgDeliveryMinutes)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-teal-500/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">نسبة التسليم في الوقت</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-bold">{performance.onTimeRate}%</p>
                            {performance.onTimeRate >= 80 ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-rose-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.2 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-rose-500/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">معدل الإلغاء</p>
                          <p className="text-xl font-bold">{performance.cancelRate}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Performance Chart + Captain Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }} className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">أداء التوصيل اليومي</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performance.dailyPerformance} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(performance.dailyPerformance.length / 7))} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend />
                          <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} name="تم التسليم" />
                          <Bar dataKey="cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} name="ملغي" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">أداء الكبائن</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[340px] overflow-y-auto custom-scrollbar">
                      {performance.captainPerformance.length > 0 ? (
                        performance.captainPerformance.map((captain, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{captain.name}</p>
                              <p className="text-xs text-muted-foreground">{captain.deliveries} توصيلة</p>
                            </div>
                            <div className="text-left flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-medium">{captain.avgRating}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{formatMinutes(captain.avgTime)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          ) : null}
        </TabsContent>

        {/* ===== Tab 4: Captains ===== */}
        <TabsContent value="captains" className="space-y-6">
          {loading ? (
            <CaptainsSkeleton />
          ) : captains ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">كبائن متصلين</p>
                          <p className="text-xl font-bold">{formatNumber(captains.onlineCaptains)} / {formatNumber(captains.totalCaptains)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.1 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Star className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">متوسط التقييم</p>
                          <div className="flex items-center gap-1">
                            <p className="text-xl font-bold">{captains.avgRating}</p>
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: 0.2 }}>
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">توصيلات الفترة</p>
                          <p className="text-xl font-bold">{formatNumber(captains.totalDeliveriesPeriod)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Chart + Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.3 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">أفضل 10 كبائن</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {captains.top10Chart.length > 0 ? (
                        <ResponsiveContainer width="100%" height={340}>
                          <BarChart data={captains.top10Chart} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="deliveries" radius={[0, 6, 6, 0]} barSize={18} name="التوصيلات">
                              {captains.top10Chart.map((_, index) => (
                                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[340px] text-muted-foreground text-sm">
                          لا توجد بيانات
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div {...fadeInUp} transition={{ duration: 0.4, delay: 0.4 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">لوحة المتصدرين</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      <div className="space-y-2">
                        {captains.rankings.length > 0 ? (
                          captains.rankings.map((captain, i) => (
                            <div
                              key={captain.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                            >
                              {/* Rank */}
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                i === 0 ? 'bg-amber-500 text-white' :
                                i === 1 ? 'bg-gray-400 text-white' :
                                i === 2 ? 'bg-amber-700 text-white' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {i + 1}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">{captain.name}</p>
                                  <Badge variant={captain.isOnline ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                                    {captain.isOnline ? 'متصل' : 'غير متصل'}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    {captain.rating}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatMinutes(captain.avgDeliveryMinutes)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {captain.vehicleType === 'MOTORCYCLE' ? 'دراجة' :
                                     captain.vehicleType === 'CAR' ? 'سيارة' :
                                     captain.vehicleType === 'VAN' ? 'فان' : 'شاحنة'}
                                  </span>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="text-left flex-shrink-0">
                                <p className="text-sm font-bold text-emerald-600">{captain.periodDeliveries}</p>
                                <p className="text-[10px] text-muted-foreground">توصيلة</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Reusable Stat Card =====
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  index,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  index: number;
  trend?: 'up' | 'down';
}) {
  return (
    <motion.div {...fadeInUp} transition={{ duration: 0.3, delay: index * 0.05 }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            {trend && (
              trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              )
            )}
          </div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold mt-1">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===== Skeleton Loaders =====
function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RevenueSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-48 mt-3" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CaptainsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-28 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
            <CardContent><Skeleton className="h-[340px] w-full" /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
