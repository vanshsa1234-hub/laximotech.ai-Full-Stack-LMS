'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Play, Brain, Award } from 'lucide-react';

const steps = [
  { icon: ShoppingCart, num: '01', color: 'bg-blue-100 text-brand-blue', title: 'Choose & Pay', desc: 'Apna course chunein. Sirf Rs 399 mein UPI, Cards ya Wallets se pay karein. Instant confirmation milega.' },
  { icon: Play,         num: '02', color: 'bg-orange-100 text-brand-orange', title: 'Watch & Learn', desc: 'HD videos Hindi mein dekho. Speed control, subtitles, bookmarks — apni pace se seekho.' },
  { icon: Brain,        num: '03', color: 'bg-purple-100 text-purple-600', title: 'Practice & Build', desc: 'Quizzes solve karo, code likho in-browser. Real projects banao jo portfolio mein jaayein.' },
  { icon: Award,        num: '04', color: 'bg-green-100 text-brand-green', title: 'Get Certified', desc: 'Course complete karo — verifiable certificate milega. LinkedIn pe share karo, jobs ke liye use karo.' },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="section-label">Simple Process</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title mt-2">
            4 Steps Mein <span>Expert Bano</span>
          </motion.h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-brand-blue via-brand-orange to-brand-green" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-300">{step.num}</div>

                {/* Icon */}
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}
                  className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-5 shadow-card`}>
                  <step.icon size={28} />
                </motion.div>

                <h3 className="font-heading font-semibold text-gray-900 text-lg mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-4 text-gray-300 text-xl z-10">→</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
