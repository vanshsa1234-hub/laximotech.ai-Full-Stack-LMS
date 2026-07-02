'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Shield, Zap, HeadphonesIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to]);

  return <span ref={ref}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

const stats = [
  { value: 10000, suffix: '+', label: 'Students Enrolled' },
  { value: 25,    suffix: '+', label: 'Expert Courses' },
  { value: 399,   suffix: '',  label: 'Price Per Course (Rs)' },
  { value: 98,    suffix: '%', label: 'Completion Rate' },
];

const trust = [
  { icon: Shield,         text: 'Secure Payments',      sub: 'Razorpay UPI/Cards' },
  { icon: Zap,            text: 'Instant Access',        sub: 'Start in 60 seconds' },
  { icon: RefreshCw,      text: '30-Day Refund',         sub: 'No questions asked' },
  { icon: HeadphonesIcon, text: '24/7 Support',          sub: 'Hindi & English' },
];

export function TrustBar() {
  return (
    <section className="bg-white border-y border-gray-100">
      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="font-heading font-bold text-brand-blue text-3xl md:text-4xl mb-1">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <div className="border-t border-gray-50 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trust.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <t.icon size={16} className="text-brand-blue" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{t.text}</div>
                  <div className="text-xs text-gray-500">{t.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
