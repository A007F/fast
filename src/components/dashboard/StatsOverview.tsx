'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  Users,
  Banknote,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

interface Stats {
  parcels: {
    total: number;
    pending: number;
    pickedUp: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
    returned: number;
    today: number;
    todayDelivered: number;
  };
  captains: {
    total: number;
    online: number;
    offline: number;
  };
  revenue: {
    total: number;
  };
  users: {
    total: number;
  };
}

const statsCards = [
  {
    key: 'totalParcels',
    label: 'إجمالي الطرود',
    icon: Package,
    color: 'bg-primary/10 text-primary',
    trend: 12.5,
  },
  {
    key: 'inTransit',
    label: 'طرود قيد التوصيل',
    icon: Truck,
    color: 'bg-yellow-500/10 text-yellow-600',
    trend: 8.2,
  },
  {
    key: 'onlineCaptains',
    label: 'الكبائن النشطون',
    icon: Users,
    color: 'bg-emerald-500/10 text-emerald-600',
    trend: 5.1,
  },
  {
    key: 'revenue',
    label: 'الإيرادات',
    icon: Banknote,
    color: 'bg-violet-500/10 text-violet-600',
    trend: 15.3,
  },
];

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (err) {
        console.error('خطأ في جلب الإحصائيات:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatValue = (key: string) => {
    if (!stats) return 0;
    switch (key) {
      case 'totalParcels':
        return stats.parcels.total;
      case 'inTransit':
        return stats.parcels.inTransit + stats.parcels.pickedUp;
      case 'onlineCaptains':
        return stats.captains.online;
      case 'revenue':
        return stats.revenue.total;
      default:
        return 0;
    }
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SA')} ر.س`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('ar-SA');
  };

  // Chart data - bar chart for parcels by status
  const statusChartData = stats
    ? [
        { name: 'معلق', value: stats.parcels.pending, fill: '#f59e0b' },
        { name: 'تم الاستلام', value: stats.parcels.pickedUp, fill: '#3b82f6' },
        { name: 'قيد التوصيل', value: stats.parcels.inTransit, fill: '#eab308' },
        { name: 'تم التسليم', value: stats.parcels.delivered, fill: '#10b981' },
        { name: 'ملغي', value: stats.parcels.cancelled, fill: '#ef4444' },
        { name: 'مرتجع', value: stats.parcels.returned, fill: '#8b5cf6' },
      ].filter((d) => d.value > 0)
    : [];

  // Chart data - area chart for daily revenue (mock data)
  const revenueChartData = [
    { day: 'السبت', revenue: 2400 },
    { day: 'الأحد', revenue: 1398 },
    { day: 'الاثنين', revenue: 3200 },
    { day: 'الثلاثاء', revenue: 2780 },
    { day: 'الأربعاء', revenue: 1890 },
    { day: 'الخميس', revenue: 2390 },
    { day: 'الجمعة', revenue: 3490 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          const value = getStatValue(card.key);
          const isRevenue = card.key === 'revenue';

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      {loading ? (
                        <>
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-8 w-16" />
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {card.label}
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {isRevenue
                              ? formatCurrency(value)
                              : formatNumber(value)}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {card.trend > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        card.trend > 0
                          ? 'text-emerald-500'
                          : 'text-red-500'
                      }`}
                    >
                      {Math.abs(card.trend)}%
                    </span>
                    <span className="text-xs text-muted-foreground mr-1">
                      مقارنة بالأمس
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Parcels by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                الطرود حسب الحالة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={statusChartData}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background))',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Area Chart - Daily Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                الإيرادات اليومية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--background))',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [
                      `${value.toLocaleString('ar-SA')} ر.س`,
                      'الإيرادات',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">طرود اليوم</p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {loading ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      stats?.parcels.today ?? 0
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    تم التسليم اليوم
                  </p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {loading ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      stats?.parcels.todayDelivered ?? 0
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    إجمالي المستخدمين
                  </p>
                  <p className="text-xl font-bold text-foreground mt-1">
                    {loading ? (
                      <Skeleton className="h-7 w-10" />
                    ) : (
                      stats?.users.total ?? 0
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
