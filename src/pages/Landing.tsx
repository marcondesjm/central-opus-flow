import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { SocialProofBar } from '@/components/landing/SocialProofBar';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LaunchPromoSection } from '@/components/landing/LaunchPromoSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';
import { Footer } from '@/components/landing/Footer';
import { SocialProofNotification } from '@/components/landing/SocialProofNotification';
import { WhatsAppSupportButton } from '@/components/support/WhatsAppSupportButton';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SocialProofNotification />
      <WhatsAppSupportButton />
      <LandingHeader />

      {/* 1. Hero — valor direto */}
      <HeroSection />

      {/* 2. Prova social */}
      <SocialProofBar />

      {/* 3. Preview do dashboard */}
      <DashboardPreview />

      {/* 4. Problema */}
      <ProblemSection />

      {/* 5. Solução */}
      <SolutionSection />

      {/* 6. Features */}
      <FeaturesSection />

      {/* 7. Resultados */}
      <BenefitsSection />

      {/* 8. Depoimentos */}
      <TestimonialsSection />

      {/* 9. Pricing */}
      <PricingSection />

      {/* 10. Promo */}
      <LaunchPromoSection />

      {/* 11. Trust */}
      <TrustSection />

      {/* 12. FAQ */}
      <FAQSection />

      {/* 13. CTA final */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
