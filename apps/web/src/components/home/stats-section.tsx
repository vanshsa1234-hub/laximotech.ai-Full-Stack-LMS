'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { usePlatformStats } from '@/hooks/use-queries';

function AnimatedCounter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView || !to) return;
    let start = 0; const step = to / 80;
    const t = setInterval(() => { start += step; if (start >= to) { setCount(to); clearInterval(t); } else setCount(Math.floor(start)); }, 16);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

export function StatsSection() {
  const { data: platformStats, isLoading } = usePlatformStats();
  const s = platformStats as any;

  // Every number here is real, computed from the database — no fabricated
  // "98% satisfaction" style figures. A stat with no real data behind it
  // yet (e.g. avgRating with zero reviews) is simply left out rather than
  // padded with a placeholder.
  const stats = [
    { value: s?.totalStudents,  suffix: '+',  label: 'Students Enrolled',   desc: 'Across India' },
    { value: s?.totalCourses,   suffix: '+',  label: 'Expert Courses',      desc: 'Multiple categories' },
    { value: 399,               prefix: 'Rs ', label: 'Per Course',         desc: 'Flat price, no hidden fees' },
    { value: s?.avgCourseDurationHrs, suffix: 'hrs', label: 'Avg Course Length', desc: 'Per course' },
    { value: s?.completionRate, suffix: '%',  label: 'Completion Rate',     desc: 'Of enrolled students' },
    { value: s?.totalCertificates, suffix: '+', label: 'Certificates Issued', desc: 'LinkedIn-verifiable' },
  ].filter(stat => stat.value != null && stat.value > 0); // hide anything with no real data yet

  return (
    <section className="py-20 bg-mesh relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-32 -right-32 w-96 h-96 border border-white/5 rounded-full" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] border border-white/5 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="font-heading font-bold text-white text-h2">
            Numbers Jo <span className="text-brand-orange">Trust</span> Build Karte Hain
          </motion.h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="card-glass-dark rounded-2xl p-6 h-32 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.04 }}
                className="card-glass-dark rounded-2xl p-6 text-center group">
                <div className="font-heading font-bold text-white text-4xl md:text-5xl mb-2 group-hover:text-brand-orange transition-colors">
                  <AnimatedCounter to={s.value} suffix={s.suffix ?? ''} prefix={s.prefix ?? ''} />
                </div>
                <div className="text-white font-semibold text-base mb-1">{s.label}</div>
                <div className="text-white/50 text-xs">{s.desc}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
