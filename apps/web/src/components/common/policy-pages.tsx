'use client';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Loader2 } from 'lucide-react';
import { useSiteContent } from '@/hooks/use-queries';

function PolicyPage({ title, contentKey }: { title: string; contentKey: 'privacy' | 'terms' }) {
  const { data: res, isLoading } = useSiteContent(contentKey);
  const content = (res as any)?.data;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-bold text-gray-900 text-3xl mb-8">{title}</h1>
          <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 prose prose-gray max-w-none">
            {isLoading || !content ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="text-brand-blue animate-spin" /></div>
            ) : (
              <>
                <p className="text-gray-500 text-sm mb-6">Last updated: {content.lastUpdated}</p>
                {(content.sections ?? []).map((s: { heading: string; body: string }, i: number) => (
                  <div key={i}>
                    <h2>{s.heading}</h2>
                    <p>{s.body}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function PrivacyPage() {
  return <PolicyPage title="Privacy Policy" contentKey="privacy" />;
}

export function TermsPage() {
  return <PolicyPage title="Terms of Service" contentKey="terms" />;
}
