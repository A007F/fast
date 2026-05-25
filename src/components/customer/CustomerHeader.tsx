'use client';

import { motion } from 'framer-motion';
import { ArrowRight, LogOut, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationsPanel from '@/components/shared/NotificationsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

interface CustomerHeaderProps {
  onBack: () => void;
  activeParcelsCount?: number;
}

export default function CustomerHeader({ onBack, activeParcelsCount = 0 }: CustomerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const customerName = 'أحمد محمد العتيبي';
  const customerPhone = '+966500000002';

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Back button + Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-primary/5 text-primary"
              aria-label="العودة"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-primary">حسابي</span>
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationsPanel token={typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null} />

            {/* User Info Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 hover:bg-primary/5 px-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      أح
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {customerName}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {customerPhone}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{customerName}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{customerPhone}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 ml-2" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="h-4 w-4 ml-2" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Left Section */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Notification Bell Mobile */}
            <NotificationsPanel token={typeof window !== 'undefined' ? localStorage.getItem('saree3_token') : null} />

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="القائمة">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      أح
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetTitle className="text-right text-lg font-bold text-primary">
                  حسابي
                </SheetTitle>
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                        أح
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{customerName}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{customerPhone}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                      <User className="h-4 w-4" />
                      <span>الملف الشخصي</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                      <LogOut className="h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
