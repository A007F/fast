'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Package, Bike, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import NotificationsPanel from '@/components/shared/NotificationsPanel';

interface CaptainHeaderProps {
  captainName: string;
  vehicleBrand: string;
  licensePlate: string;
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  onToggleOnline: (value: boolean) => void;
  onBack: () => void;
}

export default function CaptainHeader({
  captainName,
  vehicleBrand,
  licensePlate,
  rating,
  totalDeliveries,
  isOnline,
  onToggleOnline,
  onBack,
}: CaptainHeaderProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-3.5 w-3.5 text-muted-foreground/30" />
        );
      }
    }
    return stars;
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border-b border-border sticky top-0 z-40"
    >
      <div className="px-4 sm:px-6 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-full hover:bg-primary/10"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <h1 className="text-base sm:text-lg font-bold text-foreground">
                  {captainName}
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Bike className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {vehicleBrand} • {licensePlate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationsPanel token={typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null} />

            {/* Rating */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 rounded-lg">
              {renderStars(rating)}
              <span className="text-xs font-semibold text-yellow-700 mr-1">
                {rating.toFixed(1)}
              </span>
            </div>

            {/* Deliveries badge */}
            <Badge
              variant="secondary"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"
            >
              <Package className="h-3 w-3" />
              <span className="text-xs font-semibold">{totalDeliveries}</span>
            </Badge>
          </div>
        </div>

        {/* Bottom row: Online toggle */}
        <div className="mt-3 flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-colors ${
                isOnline
                  ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                  : 'bg-gray-400'
              }`}
            />
            <span
              className={`text-sm font-semibold transition-colors ${
                isOnline ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {isOnline ? 'متصل الآن' : 'غير متصل'}
            </span>
          </div>
          <Switch
            checked={isOnline}
            onCheckedChange={onToggleOnline}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        {/* Mobile rating */}
        <div className="sm:hidden flex items-center gap-1.5 mt-2 justify-center">
          {renderStars(rating)}
          <span className="text-xs font-semibold text-yellow-700 mr-1">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
