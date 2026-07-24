import { HeroSection }        from '@/components/home/hero-section';
import { TrustBar }           from '@/components/home/trust-bar';
import { FeaturedCourses }    from '@/components/home/featured-courses';
import { HowItWorks }         from '@/components/home/how-it-works';
import { CareerPathsSection } from '@/components/home/career-paths-section';
import { StatsSection }       from '@/components/home/stats-section';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { AiFeatureSection }   from '@/components/home/ai-feature-section';
import { PricingSection }     from '@/components/home/pricing-section';
import { BlogPreview }        from '@/components/home/blog-preview';
import { FaqSection }         from '@/components/home/faq-section';
import { CtaBanner }          from '@/components/home/cta-banner';
import { Navbar }             from '@/components/layout/navbar';
import { Footer }             from '@/components/layout/footer';
import { AiStudyBuddy }       from '@/components/ai/study-buddy';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustBar />
        <FeaturedCourses />
        <HowItWorks />
        <StatsSection />
        <CareerPathsSection />
        <AiFeatureSection />
        <TestimonialsSection />
        <PricingSection />
        <BlogPreview />
        <FaqSection />
        <CtaBanner />
      </main>
      <Footer />
      {/* Real, functional AI assistant — usable without logging in */}
      <AiStudyBuddy />
    </>
  );
}
