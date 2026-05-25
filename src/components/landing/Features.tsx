'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  BadgeDollarSign,
  Headphones,
  ShieldCheck,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: <MapPin className="h-6 w-6" />,
    title: 'تتبع لحظي',
    description: 'تابع طردك لحظة بلحظة على الخريطة',
  },
  {
    icon: <BadgeDollarSign className="h-6 w-6" />,
    title: 'أسعار تنافسية',
    description: 'أسعار شفافة ومنافسة بدون رسوم خفية',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'دعم 24/7',
    description: 'فريق دعم متوفر على مدار الساعة',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'تأمين الشحنات',
    description: 'جميع الشحنات مؤمنة ضد التلف والفقدان',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'دفع مرن',
    description: 'ادفع نقداً أو بطاقة أو عبر المحفظة',
  },
  {
    icon: <UserCheck className="h-6 w-6" />,
    title: 'كابتن موثوق',
    description: 'كبائن معتمدين وموثوقين وتقييماتهم مرئية',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-muted/30">
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
            لماذا تختار <span className="text-primary">سريع</span>؟
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            نوفر لك أفضل تجربة توصيل مع مميزات فريدة تجعلنا الخيار الأول
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="h-full bg-card border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default">
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="bg-primary/10 rounded-2xl p-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
