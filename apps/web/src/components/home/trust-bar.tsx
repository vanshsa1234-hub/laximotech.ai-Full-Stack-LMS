'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Shield, Zap, HeadphonesIcon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlatformStats } from '@/hooks/use-queries';

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });

  useEffect(() => {
    if (!inView || !to) return;
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

const trust = [
  { icon: Shield,         text: 'Secure Payments',      sub: 'Razorpay UPI/Cards' },
  { icon: Zap,            text: 'Instant Access',        sub: 'Start in 60 seconds' },
  { icon: RefreshCw,      text: 'Lifetime Access',       sub: 'Learn at your own pace' },
  { icon: HeadphonesIcon, text: '24/7 Support',          sub: 'Hindi & English' },
];

export function TrustBar() {
  const { data: platformStats, isLoading } = usePlatformStats();
  const s = platformStats as any;

  // All real, computed from the database — no placeholder numbers while loading.
  const stats = [
    { value: s?.totalStudents ?? 0,  suffix: '+', label: 'Students Enrolled' },
    { value: s?.totalCourses  ?? 0,  suffix: '+', label: 'Expert Courses' },
    { value: s?.avgRating ? Math.round(s.avgRating * 10) / 10 : null, suffix: '/5', label: 'Avg. Course Rating' },
    { value: s?.completionRate ?? null, suffix: '%', label: 'Completion Rate' },
  ];

  return (
    <section className="bg-white border-y border-gray-100">
      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((st, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="font-heading font-bold text-brand-blue text-3xl md:text-4xl mb-1">
                {isLoading ? '—' : st.value != null ? <Counter to={st.value} suffix={st.suffix} /> : 'New'}
              </div>
              <div className="text-gray-500 text-sm">{st.label}</div>
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
