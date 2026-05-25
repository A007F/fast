'use client';

import { motion } from 'framer-motion';
import { ClipboardList, PackageCheck, Truck } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: <ClipboardList className="h-7 w-7" />,
    title: 'اطلب التوصيل',
    description: 'أنشئ طلبك وأحدد عنوان الاستلام والتسليم',
  },
  {
    number: 2,
    icon: <PackageCheck className="h-7 w-7" />,
    title: 'استلم الكابتن طردك',
    description: 'يصل الكابتن لموقعك ويستلم الطرد',
  },
  {
    number: 3,
    icon: <Truck className="h-7 w-7" />,
    title: 'توصيل سريع',
    description: 'يتم توصيل طردك بأمان وسرعة',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            كيف تعمل <span className="text-primary">الخدمة</span>؟
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            ثلاث خطوات بسيطة فقط للحصول على خدمة توصيل سريعة وموثوقة
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-0 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-24 right-[16.67%] left-[16.67%] h-0.5 bg-gradient-to-l from-primary/20 via-primary/40 to-primary/20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="flex-1 relative"
            >
              <div className="flex flex-col items-center text-center px-4">
                {/* Number circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 relative z-10">
                    <div className="text-primary">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold z-20">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
