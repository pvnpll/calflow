import type { Metadata } from "next";
import { createClient } from '@/lib/supabase/server';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { AiSection } from '@/components/landing/AiSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CtaSection, LandingFooter } from '@/components/landing/FooterSections';
import { ComparisonStrip } from '@/components/landing/ComparisonStrip';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CalFlow — AI-Powered Nutrition Tracking',
  description:
    'Track your nutrition, water and weight, connect AI assistants like ChatGPT and Claude, discover insights and get personalized recommendations with CalFlow.',
  openGraph: {
    title: 'CalFlow — AI-Powered Nutrition Tracking',
    description:
      'Track your nutrition, water and weight, connect AI assistants like ChatGPT and Claude, discover insights and get personalized recommendations with CalFlow.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalFlow — AI-Powered Nutrition Tracking',
    description:
      'Track your nutrition, water and weight, connect AI assistants like ChatGPT and Claude, discover insights and get personalized recommendations with CalFlow.',
  },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <LandingNav isLoggedIn={isLoggedIn} />

      <main>
        <HeroSection isLoggedIn={isLoggedIn} />
        <ComparisonStrip />
        <ProductSection />
        <AiSection />
        <HowItWorksSection />
        <CtaSection isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}

