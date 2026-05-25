'use client';

import { Truck, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'عن سريع', href: '#how-it-works' },
  { label: 'الأسعار', href: '#features' },
  { label: 'المدونة', href: '#' },
];

const supportLinks = [
  { label: 'مركز المساعدة', href: '#' },
  { label: 'الشروط والأحكام', href: '#' },
  { label: 'سياسة الخصوصية', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary rounded-xl p-2">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">سريع</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed max-w-xs">
              خدمة التوصيل السريع الأولى في المنطقة. نوفر لك تجربة توصيل موثوقة وسريعة مع تتبع لحظي ودعم متواصل.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-base mb-4">روابط سريعة</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-base mb-4">الدعم</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-background/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-base mb-4">تواصل معنا</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-background/60">
                <Mail className="h-4 w-4 shrink-0" />
                info@saree3.com
              </li>
              <li className="flex items-center gap-2 text-sm text-background/60">
                <Phone className="h-4 w-4 shrink-0" />
                <span dir="ltr">+962XXXXXXXX</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-background/10 my-8" />

        <div className="text-center text-sm text-background/40">
          © 2024 سريع. جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
