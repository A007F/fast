'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Menu, LayoutDashboard, UserCircle, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';

const navLinks = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'كيف تعمل', href: '#how-it-works' },
  { label: 'المميزات', href: '#features' },
  { label: 'تتبع شحنتك', href: '#track' },
];

interface HeaderProps {
  onOpenDashboard?: () => void;
  onOpenCustomer?: () => void;
  onOpenCaptain?: () => void;
}

export default function Header({ onOpenDashboard, onOpenCustomer, onOpenCaptain }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 backdrop-blur-lg shadow-sm border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="bg-primary rounded-xl p-2 group-hover:scale-110 transition-transform">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary">
              سريع
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {onOpenCustomer && (
              <Button
                variant="outline"
                onClick={onOpenCustomer}
                className="border-primary/30 text-primary hover:bg-primary/5 rounded-lg px-4"
              >
                <UserCircle className="h-4 w-4 ml-1" />
                حسابي
              </Button>
            )}
            {onOpenCaptain && (
              <Button
                variant="outline"
                onClick={onOpenCaptain}
                className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 rounded-lg px-4"
              >
                <ClipboardList className="h-4 w-4 ml-1" />
                الكابتن
              </Button>
            )}
            {onOpenDashboard && (
              <Button
                variant="outline"
                onClick={onOpenDashboard}
                className="border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 rounded-lg px-4"
              >
                <LayoutDashboard className="h-4 w-4 ml-1" />
                الإدارة
              </Button>
            )}
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-6">
              تسجيل الكابتن
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-right text-lg font-bold text-primary flex items-center gap-2">
                <Truck className="h-5 w-5" />
                سريع
              </SheetTitle>
              <nav className="flex flex-col gap-1 mt-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-4 pt-4 border-t space-y-2">
                  {onOpenCustomer && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenCustomer();
                      }}
                      className="w-full border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <UserCircle className="h-4 w-4 ml-1" />
                      حسابي
                    </Button>
                  )}
                  {onOpenCaptain && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenCaptain();
                      }}
                      className="w-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                    >
                      <ClipboardList className="h-4 w-4 ml-1" />
                      الكابتن
                    </Button>
                  )}
                  {onOpenDashboard && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full border-muted-foreground/30 text-muted-foreground hover:bg-muted/50"
                    >
                      <LayoutDashboard className="h-4 w-4 ml-1" />
                      الإدارة
                    </Button>
                  )}
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    تسجيل الكابتن
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
