import { createClient } from '@/lib/supabase/server';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { AiEcosystem } from '@/components/landing/AiEcosystem';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { CtaSection, LandingFooter } from '@/components/landing/FooterSections';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 selection:bg-blue-200 dark:selection:bg-blue-900 font-sans">
      <LandingNav isLoggedIn={isLoggedIn} />
      
      <main>
        <HeroSection isLoggedIn={isLoggedIn} />
        <ComparisonSection />
        <AiEcosystem />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection isLoggedIn={isLoggedIn} />
      </main>

      <LandingFooter />
    </div>
  );
}
