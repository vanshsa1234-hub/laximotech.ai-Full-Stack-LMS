'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

// ── Blog Preview ─────────────────────────────────────────────
const posts = [
  { slug: 'ai-jobs-india-2025', title: 'AI Jobs in India 2025 — Complete Guide for Freshers', excerpt: 'AI market India mein 2025 mein Rs 40,000 crore ke paar. Kaunsi skills? Konsi companies? Puri guide yahan.', date: '15 Jun 2025', readMin: 8 },
  { slug: 'python-vs-r-data-science-hindi', title: 'Python vs R — Data Science ke liye kaunsa seekhein?', excerpt: 'Honest comparison dono ka — Indian job market perspective se. Pehle kaunsa seekhein?', date: '12 Jun 2025', readMin: 6 },
  { slug: 'rs-399-course-worth-it', title: 'Rs 399 mein Course? Kya Yeh Sach Mein Itna Acha Hai?', excerpt: 'Honestly explain kiya hai kaise hum Rs 399 mein premium content de paate hain. No bullshit.', date: '8 Jun 2025', readMin: 5 },
];

export function BlogPreview() {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.div key={post.slug}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }} className="group">
              <Link href={`/blog/${post.slug}`}>
                <div className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readMin} min read</span>
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
      </div>
    </section>
  );
}

// ── FAQ Section ──────────────────────────────────────────────
const faqs = [
  { q: 'Kya course lifetime ke liye accessible hai?', a: 'Haan! Ek baar buy karo, lifetime access milega. Course kabhi expire nahi hoga, chahe hum future mein updates bhi karte rahein.' },
  { q: 'Certificate kitna valid hai?', a: 'Certificate uniquely verifiable hai — har ek ka apna ID hota hai. laximotech.ai/verify pe koi bhi verify kar sakta hai. LinkedIn pe share karo, job applications mein use karo.' },
  { q: 'Kya Hindi medium students ke liye suitable hai?', a: 'Bilkul! Ye platform specifically Hindi medium students ke liye banaya gaya hai. Explanation Hindi mein, technical terms English mein — exact wahi approach jo IIT-JEE coaching mein hoti hai.' },
  { q: 'Agar course pasand na aaya toh?', a: '30-day money-back guarantee hai. Koi sawal nahi poochha jaayega. Email karo hello@laximotech.ai — usi din refund process ho jaata hai.' },
  { q: 'Mobile pe kaam karta hai?', a: 'Haan, PWA hai — mobile pe bilkul smooth chalega. Android phone pe install bhi kar sakte ho. Offline viewing bhi future mein aane waali hai.' },
  { q: 'Ek se zyada course khareed sakte hain?', a: 'Bilkul! Sab alag-alag Rs 399 ke hain. Career path bundle mein khareedne par aur discount milta hai. LAUNCH50 code se 50% off bhi milta hai launch ke dauran.' },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
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
              Aaj Hi Shuru Karo — Rs 399 Mein
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              25+ courses. Certificate included. Hindi mein. Lifetime access. Koi excuse nahi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className="bg-brand-orange text-white font-heading font-bold px-8 py-4 rounded-full shadow-orange-lg hover:bg-brand-orange-light transition-all flex items-center justify-center gap-2">
                Browse All Courses <ArrowRight size={16} />
              </Link>
              <Link href="/demo" className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                Book Free Demo
              </Link>
            </div>
            <p className="text-white/40 text-xs mt-6">No credit card required · Cancel anytime · 30-day refund</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
