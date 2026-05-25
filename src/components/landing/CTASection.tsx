'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Download, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-primary via-primary to-primary/80" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMEgydjRoMzR6TTIgMjBoMzR2LTJIMHZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            انضم إلى فريقنا
            <br />
            كبابتن توصيل
          </h2>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            ابدأ رحلتك مع سريع واحصل على دخل مميز مع مرونة في العمل
            وسط مجموعة من أفضل الكبائن في المنطقة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 rounded-xl px-8 py-6 text-base font-semibold shadow-lg"
            >
              <UserPlus className="h-5 w-5" />
              سجّل كبابتن
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl px-8 py-6 text-base font-semibold"
            >
              <Download className="h-5 w-5" />
              حمّل التطبيق
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
