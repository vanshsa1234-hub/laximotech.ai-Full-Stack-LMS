'use client';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { Heart, Target, Loader2 } from 'lucide-react';
import { useSiteContent } from '@/hooks/use-queries';

export default function AboutPage() {
  const { data: res, isLoading } = useSiteContent('about');
  const content = (res as any)?.data;

  if (isLoading || !content) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-brand-ice">
          <Loader2 size={28} className="text-brand-blue animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        {/* Hero */}
        <div className="bg-mesh pt-28 pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-4">{content.heroTitle}</h1>
            <p className="text-white/75 text-xl max-w-2xl mx-auto">{content.heroSubtitle}</p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          {/* Mission */}
          <div className="text-center">
            <span className="section-label flex items-center justify-center gap-2 mb-3"><Heart size={14} /> Our Mission</span>
            <h2 className="section-title mb-6">{content.missionTitle}</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">{content.missionText}</p>
          </div>

          {/* Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label mb-3 flex items-center gap-2"><Target size={14} /> Our Story</span>
              <h2 className="section-title mb-6">{content.storyTitle}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {(content.storyParagraphs ?? []).map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-blue to-purple-700 rounded-3xl p-8 text-white">
              <div className="text-4xl mb-4">💡</div>
              <blockquote className="font-heading font-semibold text-xl leading-relaxed mb-4">
                "{content.quoteText}"
              </blockquote>
              <div className="text-white/60 text-sm">{content.quoteAuthor}</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white rounded-3xl p-10 shadow-card border border-gray-100">
            <h3 className="font-heading font-bold text-2xl text-gray-900 mb-3">{content.ctaTitle}</h3>
            <p className="text-gray-500 mb-6">{content.ctaSubtitle}</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/courses" className="btn-primary">Browse Courses</Link>
              <Link href="/contact" className="btn-outline">Partner With Us</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
