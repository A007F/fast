'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Star,
  Package,
  Clock,
  MapPin,
  Wallet,
  ArrowUpLeft,
  ArrowDownLeft,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CAPTAIN_ID = 'cmpjwmui00004kjlwle7k39ml';

interface Transaction {
  id: string;
  date: string;
  trackingNumber: string;
  deliveryFee: number;
  platformFee: number;
  netEarning: number;
}

// Mock data for demo
const weeklyEarnings = [
  { day: 'السبت', earnings: 145 },
  { day: 'الأحد', earnings: 230 },
  { day: 'الاثنين', earnings: 180 },
  { day: 'الثلاثاء', earnings: 320 },
  { day: 'الأربعاء', earnings: 265 },
  { day: 'الخميس', earnings: 290 },
  { day: 'الجمعة', earnings: 210 },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-01-15',
    trackingNumber: 'SR-12345678',
    deliveryFee: 25,
    platformFee: 5,
    netEarning: 20,
  },
  {
    id: '2',
    date: '2025-01-15',
    trackingNumber: 'SR-23456789',
    deliveryFee: 30,
    platformFee: 6,
    netEarning: 24,
  },
  {
    id: '3',
    date: '2025-01-14',
    trackingNumber: 'SR-34567890',
    deliveryFee: 18,
    platformFee: 3.6,
    netEarning: 14.4,
  },
  {
    id: '4',
    date: '2025-01-14',
    trackingNumber: 'SR-45678901',
    deliveryFee: 35,
    platformFee: 7,
    netEarning: 28,
  },
  {
    id: '5',
    date: '2025-01-13',
    trackingNumber: 'SR-56789012',
    deliveryFee: 22,
    platformFee: 4.4,
    netEarning: 17.6,
  },
  {
    id: '6',
    date: '2025-01-13',
    trackingNumber: 'SR-67890123',
    deliveryFee: 28,
    platformFee: 5.6,
    netEarning: 22.4,
  },
  {
    id: '7',
    date: '2025-01-12',
    trackingNumber: 'SR-78901234',
    deliveryFee: 40,
    platformFee: 8,
    netEarning: 32,
  },
];

interface RealStats {
  totalDeliveries: number;
  rating: number;
  todayEarnings: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-primary">
          {payload[0].value} ر.س
        </p>
      </div>
    );
  }
  return null;
}

export default function CaptainEarnings() {
  const [realStats, setRealStats] = useState<RealStats>({
    totalDeliveries: 0,
    rating: 4.8,
    todayEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/parcels?captainId=${CAPTAIN_ID}&limit=100`);
        const json = await res.json();
        if (json.success) {
          const allParcels = json.data;
          const delivered = allParcels.filter((p: { status: string }) => p.status === 'DELIVERED');
          const today = new Date().toISOString().split('T')[0];
          const todayDelivered = allParcels.filter(
            (p: { status: string; createdAt?: string }) =>
              p.status === 'DELIVERED' && p.createdAt?.startsWith(today)
          );
          const todayEarnings = todayDelivered.reduce(
            (sum: number, p: { deliveryFee: number }) => sum + p.deliveryFee * 0.8,
            0
          );

          setRealStats({
            totalDeliveries: delivered.length,
            rating: 4.8,
            todayEarnings: Math.round(todayEarnings * 100) / 100,
          });
        }
      } catch {
        // Use mock data on error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalWeekEarnings = weeklyEarnings.reduce((sum, d) => sum + d.earnings, 0);
  const todayEarningsDisplay = realStats.todayEarnings > 0
    ? realStats.todayEarnings
    : weeklyEarnings[weeklyEarnings.length - 1]?.earnings || 210;

  return (
    <div className="space-y-5 pb-6">
      {/* Main Earnings Card */}
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
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-5 w-5 text-emerald-200" />
                <span className="text-sm text-emerald-200">إيرادات اليوم</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{todayEarningsDisplay}</span>
                <span className="text-lg text-emerald-200">ر.س</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white/15 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-200">هذا الأسبوع</p>
                  <p className="text-lg font-bold">{totalWeekEarnings} ر.س</p>
                </div>
                <div className="bg-white/15 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-200">هذا الشهر</p>
                  <p className="text-lg font-bold">4,850 ر.س</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              إيرادات الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyEarnings} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }} />
                  <Bar dataKey="earnings" radius={[6, 6, 0, 0]}>
                    {weeklyEarnings.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === weeklyEarnings.length - 1
                            ? '#10b981'
                            : '#a7f3d0'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'إجمالي التوصيلات',
              value: realStats.totalDeliveries || 156,
              icon: Package,
              color: 'bg-emerald-50 text-emerald-700',
              trend: '+12%',
              up: true,
            },
            {
              label: 'متوسط التقييم',
              value: realStats.rating.toFixed(1),
              icon: Star,
              color: 'bg-amber-50 text-amber-700',
              trend: '+0.2',
              up: true,
            },
            {
              label: 'إجمالي المسافة',
              value: '2,340 كم',
              icon: MapPin,
              color: 'bg-blue-50 text-blue-700',
              trend: '+8%',
              up: true,
            },
            {
              label: 'ساعات العمل اليوم',
              value: '6.5 ساعة',
              icon: Clock,
              color: 'bg-purple-50 text-purple-700',
              trend: '-0.5 ساعة',
              up: false,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <div
                      className={`flex items-center gap-0.5 text-[10px] font-medium ${
                        stat.up ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {stat.up ? (
                        <ArrowUpLeft className="h-3 w-3" />
                      ) : (
                        <ArrowDownLeft className="h-3 w-3" />
                      )}
                      {stat.trend}
                    </div>
                  </div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              آخر المعاملات
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-0 divide-y divide-border/50">
              {mockTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {tx.trackingNumber}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {new Date(tx.date).toLocaleDateString('ar-SA', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-emerald-600">
                      +{tx.netEarning} ر.س
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>الرسوم: {tx.deliveryFee}</span>
                      <span>المنصة: -{tx.platformFee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
