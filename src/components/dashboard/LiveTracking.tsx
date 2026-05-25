'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  Package,
  Signal,
  Bike,
  Car,
  Truck as TruckIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CaptainLocation {
  id: string;
  name: string;
  vehicleType: string;
  isOnline: boolean;
  lat: number;
  lng: number;
  activeParcels: number;
  heading?: number;
}

interface ActiveParcel {
  id: string;
  trackingNumber: string;
  receiverName: string;
  receiverAddress: string;
  captainName: string;
  status: string;
  estimatedTime: string;
}

const vehicleTypeMap: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  MOTORCYCLE: { label: 'دراجة نارية', icon: Bike, color: '#10b981' },
  CAR: { label: 'سيارة', icon: Car, color: '#3b82f6' },
  VAN: { label: 'فان', icon: TruckIcon, color: '#f59e0b' },
  TRUCK: { label: 'شاحنة', icon: TruckIcon, color: '#8b5cf6' },
};

// Simulated captain positions
const initialCaptains: CaptainLocation[] = [
  {
    id: 'c1',
    name: 'أحمد محمد',
    vehicleType: 'MOTORCYCLE',
    isOnline: true,
    lat: 35,
    lng: 55,
    activeParcels: 3,
    heading: 45,
  },
  {
    id: 'c2',
    name: 'خالد العتيبي',
    vehicleType: 'CAR',
    isOnline: true,
    lat: 55,
    lng: 35,
    activeParcels: 2,
    heading: 180,
  },
  {
    id: 'c3',
    name: 'فهد الحربي',
    vehicleType: 'MOTORCYCLE',
    isOnline: true,
    lat: 70,
    lng: 60,
    activeParcels: 1,
    heading: 90,
  },
  {
    id: 'c4',
    name: 'سلطان الدوسري',
    vehicleType: 'VAN',
    isOnline: true,
    lat: 25,
    lng: 75,
    activeParcels: 4,
    heading: 270,
  },
  {
    id: 'c5',
    name: 'ماجد الشمري',
    vehicleType: 'CAR',
    isOnline: true,
    lat: 45,
    lng: 80,
    activeParcels: 2,
    heading: 135,
  },
];

const mockActiveParcels: ActiveParcel[] = [
  {
    id: 'p1',
    trackingNumber: 'SR-12345678',
    receiverName: 'عبدالله العمري',
    receiverAddress: 'حي النزهة، الرياض',
    captainName: 'أحمد محمد',
    status: 'IN_TRANSIT',
    estimatedTime: '15 دقيقة',
  },
  {
    id: 'p2',
    trackingNumber: 'SR-23456789',
    receiverName: 'سارة القحطاني',
    receiverAddress: 'حي الملقا، الرياض',
    captainName: 'خالد العتيبي',
    status: 'PICKED_UP',
    estimatedTime: '25 دقيقة',
  },
  {
    id: 'p3',
    trackingNumber: 'SR-34567890',
    receiverName: 'ناصر المطيري',
    receiverAddress: 'حي العليا، الرياض',
    captainName: 'فهد الحربي',
    status: 'IN_TRANSIT',
    estimatedTime: '10 دقيقة',
  },
  {
    id: 'p4',
    trackingNumber: 'SR-45678901',
    receiverName: 'ريم السبيعي',
    receiverAddress: 'حي الروضة، الرياض',
    captainName: 'سلطان الدوسري',
    status: 'IN_TRANSIT',
    estimatedTime: '30 دقيقة',
  },
];

const statusLabelMap: Record<string, string> = {
  PICKED_UP: 'تم الاستلام',
  IN_TRANSIT: 'قيد التوصيل',
};

const statusColorMap: Record<string, string> = {
  PICKED_UP: 'bg-blue-100 text-blue-700',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-700',
};

export default function LiveTracking() {
  const [captains, setCaptains] = useState<CaptainLocation[]>(initialCaptains);
  const [selectedCaptain, setSelectedCaptain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate live position updates
  const updatePositions = useCallback(() => {
    setCaptains((prev) =>
      prev.map((captain) => ({
        ...captain,
        lat: Math.max(5, Math.min(90, captain.lat + (Math.random() - 0.5) * 3)),
        lng: Math.max(5, Math.min(90, captain.lng + (Math.random() - 0.5) * 3)),
        heading: (captain.heading || 0) + (Math.random() - 0.5) * 20,
      }))
    );
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(updatePositions, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [updatePositions]);

  const onlineCaptains = captains.filter((c) => c.isOnline);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <Signal className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">
            البث المباشر
          </span>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          {onlineCaptains.length} كابتن نشط
        </Badge>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">
            يتم التحديث تلقائياً
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Map Placeholder */}
              <div className="relative h-[400px] sm:h-[500px] bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden">
                {/* Grid Background */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />

                {/* Map decorative elements */}
                <div className="absolute top-[15%] right-[20%] h-32 w-48 rounded-lg bg-emerald-200/30 transform rotate-12" />
                <div className="absolute bottom-[25%] left-[15%] h-24 w-40 rounded-lg bg-emerald-200/30 transform -rotate-6" />
                <div className="absolute top-[50%] right-[60%] h-20 w-32 rounded-full bg-emerald-200/20" />

                {/* Roads */}
                <div className="absolute top-0 bottom-0 right-[50%] w-1 bg-emerald-300/40" />
                <div className="absolute right-0 left-0 top-[40%] h-1 bg-emerald-300/40" />
                <div className="absolute top-0 bottom-0 right-[25%] w-0.5 bg-emerald-300/30" />
                <div className="absolute right-0 left-0 top-[70%] h-0.5 bg-emerald-300/30" />

                {/* Captain Dots */}
                {onlineCaptains.map((captain) => {
                  const vehicle = vehicleTypeMap[captain.vehicleType];
                  const isSelected = selectedCaptain === captain.id;

                  return (
                    <motion.div
                      key={captain.id}
                      className="absolute cursor-pointer z-10"
                      style={{
                        top: `${captain.lat}%`,
                        right: `${captain.lng}%`,
                        transform: 'translate(50%, -50%)',
                      }}
                      animate={{
                        top: `${captain.lat}%`,
                        right: `${captain.lng}%`,
                      }}
                      transition={{ duration: 2, ease: 'linear' }}
                      onClick={() =>
                        setSelectedCaptain(
                          isSelected ? null : captain.id
                        )
                      }
                    >
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        style={{
                          backgroundColor: vehicle?.color || '#10b981',
                          width: 32,
                          height: 32,
                          top: -8,
                          right: -8,
                        }}
                      />

                      {/* Captain Dot */}
                      <div
                        className={`relative h-16 w-16 rounded-full flex items-center justify-center shadow-lg border-3 transition-all ${
                          isSelected
                            ? 'border-foreground scale-110'
                            : 'border-background'
                        }`}
                        style={{
                          backgroundColor: vehicle?.color || '#10b981',
                        }}
                      >
                        {vehicle && (
                          <vehicle.icon className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Name Label */}
                      <div
                        className={`absolute top-full mt-1 right-1/2 translate-x-1/2 whitespace-nowrap transition-all ${
                          isSelected
                            ? 'opacity-100'
                            : 'opacity-80'
                        }`}
                      >
                        <div className="bg-foreground text-background text-xs px-2 py-1 rounded-lg shadow-md text-center">
                          <p className="font-medium">{captain.name}</p>
                          <p className="text-[10px] text-background/60">
                            {vehicle?.label} • {captain.activeParcels} طرد
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Map Legend */}
                <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border">
                  <p className="text-xs font-semibold text-foreground mb-2">
                    دليل الألوان
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(vehicleTypeMap).map(([type, info]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: info.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {info.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Side Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Selected Captain Info */}
          <AnimatePresence mode="wait">
            {selectedCaptain ? (
              <motion.div
                key={selectedCaptain}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {(() => {
                  const captain = captains.find(
                    (c) => c.id === selectedCaptain
                  );
                  if (!captain) return null;
                  const vehicle = vehicleTypeMap[captain.vehicleType];
                  const VehicleIcon = vehicle?.icon || Car;

                  return (
                    <Card className="border-primary/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback
                              className="text-white font-bold"
                              style={{
                                backgroundColor:
                                  vehicle?.color || '#10b981',
                              }}
                            >
                              {captain.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground">
                              {captain.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <VehicleIcon className="h-3.5 w-3.5" />
                              {vehicle?.label}
                            </div>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 rounded-lg bg-muted/50 text-center">
                            <p className="text-lg font-bold text-foreground">
                              {captain.activeParcels}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              طرود نشطة
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/50 text-center">
                            <p className="text-lg font-bold text-foreground">
                              {Math.round(captain.lat)}.{Math.round(captain.lng)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              الموقع
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </motion.div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    اختر كابتن من الخريطة لعرض تفاصيله
                  </p>
                </CardContent>
              </Card>
            )}
          </AnimatePresence>

          {/* Active Parcels */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                الطرود النشطة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[350px] overflow-y-auto">
              {mockActiveParcels.map((parcel) => (
                <motion.div
                  key={parcel.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.random() * 0.3 }}
                  className="p-3 rounded-xl border hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs font-mono font-medium text-foreground">
                        {parcel.trackingNumber}
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {parcel.receiverName}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        statusColorMap[parcel.status] || 'bg-gray-100'
                      }`}
                    >
                      {statusLabelMap[parcel.status] || parcel.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {parcel.receiverAddress}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      الكابتن: {parcel.captainName}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Clock className="h-3 w-3" />
                      <span>{parcel.estimatedTime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
