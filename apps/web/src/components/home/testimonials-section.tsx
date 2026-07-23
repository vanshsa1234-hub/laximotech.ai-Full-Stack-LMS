'use client';

import { motion } from 'framer-motion';
import { Star, Quote, Loader2 } from 'lucide-react';
import { useFeaturedReviews } from '@/hooks/use-queries';

export function TestimonialsSection() {
  const { data: reviews, isLoading } = useFeaturedReviews();
  const list = (reviews as any[]) ?? [];

  // No fabricated placeholders — if there are no real reviews yet, the section simply doesn't render.
  if (!isLoading && list.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Student Stories</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-2">
            Unki <span>Zindagi Badli</span> — Tumhari Bhi Badlegi
          </motion.h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 size={28} className="text-brand-blue animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 relative">
                <Quote size={28} className="text-brand-orange/20 absolute top-4 right-4" />

                <div className="flex gap-1 mb-4">
                  {[...Array(r.rating)].map((_, s) => (
                    <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-5 relative z-10">"{r.comment}"</p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {r.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.user.image} alt={r.user.name ?? 'Student'} className="w-full h-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{r.user?.name ?? 'laximotech.ai Student'}</div>
                    <div className="text-xs text-gray-500">{r.course?.title}{r.user?.city ? ` · ${r.user.city}` : ''}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
