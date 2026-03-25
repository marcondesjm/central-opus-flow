import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { DashboardPreview } from '@/components/landing/DashboardPreview';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { DifferentiationSection } from '@/components/landing/DifferentiationSection';
import { FeaturesSlideshow } from '@/components/landing/FeaturesSlideshow';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
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

      <HeroSection />
      <DashboardPreview />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <DifferentiationSection />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}
