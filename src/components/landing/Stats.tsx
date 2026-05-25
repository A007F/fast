'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const stats: StatItem[] = [
  {
    icon: <Package className="h-6 w-6" />,
    value: 10000,
    suffix: '+',
    label: 'طرد تم توصيله',
  },
  {
    icon: <Users className="h-6 w-6" />,
    value: 500,
    suffix: '+',
    label: 'كابتن نشط',
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    value: 50,
    suffix: '+',
    label: 'مدينة مغطاة',
  },
  {
    icon: <Star className="h-6 w-6" />,
    value: 4.9,
    suffix: '',
    label: 'تقييم العملاء',
  },
];

function AnimatedCounter({ value, suffix, prefix = '' }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Number(current.toFixed(1)));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const displayValue = Number.isInteger(value) ? Math.round(count).toLocaleString('en') : count.toFixed(1);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-bold text-primary">
      {prefix}{displayValue}{suffix}
    </div>
  );
}

export default function Stats() {
  return (
    <section className="py-16 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 text-center">
                <CardContent className="p-4 sm:p-6 flex flex-col items-center gap-3">
                  <div className="bg-primary/10 rounded-xl p-3 text-primary">
                    {stat.icon}
                  </div>
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    prefix={stat.prefix}
                  />
                  <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
