'use client';

import { motion } from 'framer-motion';
import { Package, MapPin, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-primary/5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-right"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6"
            >
              <Truck className="h-4 w-4" />
              خدمة التوصيل الأولى في المنطقة
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-foreground">نوصّل طُرودك</span>
              <br />
              <span className="text-primary">
                بأسرع وقت وأقل تكلفة
              </span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 lg:mr-0">
              خدمة توصيل موثوقة وآمنة مع تتبع لحظي لجميع شحناتك. انضم لألاف العملاء الذين يثقون بنا في توصيل طرودهم يومياً.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 py-6 text-base font-semibold shadow-lg shadow-primary/25"
              >
                أرسل طردك الآن
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-8 py-6 text-base font-semibold border-primary/30 hover:bg-primary/5 hover:text-primary"
              >
                انضم كبابتن
              </Button>
            </div>
          </motion.div>

          {/* Animated Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full h-96">
              {/* Central truck */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="w-28 h-28 bg-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/20">
                  <Truck className="h-14 w-14 text-primary" />
                </div>
              </motion.div>

              {/* Package top-right */}
              <motion.div
                animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute top-8 right-8"
              >
                <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                  <Package className="h-10 w-10 text-primary/70" />
                </div>
              </motion.div>

              {/* MapPin bottom-left */}
              <motion.div
                animate={{ y: [0, -6, 0], x: [0, -5, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute bottom-8 left-8"
              >
                <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                  <MapPin className="h-10 w-10 text-primary/70" />
                </div>
              </motion.div>

              {/* Package bottom-right */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                className="absolute bottom-12 right-16"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                  <Package className="h-8 w-8 text-primary/50" />
                </div>
              </motion.div>

              {/* MapPin top-left */}
              <motion.div
                animate={{ y: [0, -7, 0], x: [0, 3, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="absolute top-16 left-16"
              >
                <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10">
                  <MapPin className="h-8 w-8 text-primary/50" />
                </div>
              </motion.div>

              {/* Decorative dotted path */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
                <circle cx="300" cy="80" r="3" fill="currentColor" className="text-primary" />
                <circle cx="280" cy="130" r="2" fill="currentColor" className="text-primary" />
                <circle cx="250" cy="170" r="2.5" fill="currentColor" className="text-primary" />
                <circle cx="200" cy="200" r="3" fill="currentColor" className="text-primary" />
                <circle cx="160" cy="230" r="2" fill="currentColor" className="text-primary" />
                <circle cx="120" cy="280" r="2.5" fill="currentColor" className="text-primary" />
                <circle cx="100" cy="320" r="3" fill="currentColor" className="text-primary" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
