'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useBlogPosts, usePlatformStats, useSiteContent } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

export function BlogPreview() {
  const { data: res, isLoading } = useBlogPosts({ pageSize: '3' });
  const posts = (res as any)?.data ?? [];

  // No fabricated articles — if nothing's published yet, skip the section entirely.
  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="py-20 bg-brand-ice">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Latest Articles</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-1">
              Tech <span>Blog</span>
            </motion.h2>
          </div>
          <Link href="/blog" className="btn-outline text-sm flex-shrink-0">All Articles <ArrowRight size={14} /></Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 size={28} className="text-brand-blue animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post: any, i: number) => (
              <motion.div key={post.slug}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }} className="group">
                <Link href={`/blog/${post.slug}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all border border-gray-100 h-full flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-gray-900 text-base leading-snug mb-3 group-hover:text-brand-orange transition-colors flex-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <span className="text-brand-blue text-xs font-semibold group-hover:text-brand-orange transition-colors">
                      Read more →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── FAQ Section ──────────────────────────────────────────────
export function FaqSection() {
  const { data: res } = useSiteContent('faq');
  const faqs: { q: string; a: string }[] = (res as any)?.data?.items ?? [];
  const [open, setOpen] = useState<number | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Got Questions?</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-2">
            Frequently Asked <span>Questions</span>
          </motion.h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className={`border rounded-2xl overflow-hidden transition-colors ${open === i ? 'border-brand-orange' : 'border-gray-100'}`}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                <span className="text-brand-orange flex-shrink-0">
                  {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
                      <div className="pt-4">{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA Banner ───────────────────────────────────────────────
export function CtaBanner() {
  const { data: stats } = usePlatformStats();
  const courseText = (stats as any)?.totalCourses > 0 ? `${(stats as any).totalCourses}+ courses` : 'Multiple courses';
  return (
    <section className="py-20 bg-brand-ice">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-3xl p-12 text-white relative overflow-hidden shadow-blue">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4 text-white">
              Start Today — for Just Rs 399
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              {courseText}. Certificate included. Lifetime access. No excuses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="bg-brand-orange text-white font-heading font-bold px-8 py-4 rounded-full shadow-orange-lg hover:bg-brand-orange-light transition-all flex items-center justify-center gap-2">
                Browse All Courses <ArrowRight size={16} />
              </Link>
              <Link href="/demo" className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                Book Free Demo
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-6">No credit card required · Cancel anytime</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
