'use client';

import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import TrackParcel from '@/components/landing/TrackParcel';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onOpenDashboard={() => router.push('/dashboard')}
        onOpenCustomer={() => router.push('/customer')}
        onOpenCaptain={() => router.push('/captain')}
      />
      <main>
        <div id="home">
          <Hero />
        </div>
        <Stats />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="features">
          <Features />
        </div>
        <div id="track">
          <TrackParcel />
        </div>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
