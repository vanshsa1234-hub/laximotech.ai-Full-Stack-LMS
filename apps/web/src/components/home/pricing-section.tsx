'use client';

import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

const included = [
  'HD video lectures in Hindi + English',
  'Downloadable resources & code files',
  'In-browser code playground',
  'Section-wise quizzes with instant feedback',
  'AI Study Buddy (20 messages/day)',
  'Verifiable completion certificate',
  'LinkedIn-shareable certificate image',
  'Lifetime access — never expires',
  '30-day money-back guarantee',
  'Community discussion forum',
];

export function PricingSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Transparent Pricing</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-2">
            Ek Price — <span>Sab Kuch Included</span>
          </motion.h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-blue">

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start gap-10">
            {/* Price */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="flex items-end gap-2 justify-center lg:justify-start">
                <span className="text-white/70 text-2xl font-heading">Rs</span>
                <span className="font-heading font-bold text-7xl text-white leading-none">399</span>
              </div>
              <div className="text-brand-orange text-sm font-semibold mt-1">per course · one-time</div>

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/courses" className="bg-brand-orange text-white font-heading font-bold px-8 py-4 rounded-full shadow-orange-lg hover:bg-brand-orange-light transition-all text-center flex items-center justify-center gap-2">
                  <Zap size={16} className="fill-white" /> Enroll Now
                </Link>
                <div className="text-white/50 text-xs text-center">No subscription. Pay once, keep forever.</div>
              </div>
            </div>

            {/* Features list */}
            <div className="flex-1">
              <div className="text-white/80 font-semibold mb-4">Everything included in Rs 399:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {included.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={10} className="text-brand-orange" />
                    </div>
                    <span className="text-white/80 text-sm">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
