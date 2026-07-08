'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/courses/course-card';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useCourses } from '@/hooks/use-queries';

const FILTERS = ['All', 'AI & ML', 'Data Science', 'Programming', 'Robotics', 'Cybersecurity'];
const FILTER_MAP: Record<string, string> = {
  'AI & ML': 'AI_ML', 'Data Science': 'DATA_SCIENCE',
  'Programming': 'PROGRAMMING', 'Robotics': 'ROBOTICS_IOT', 'Cybersecurity': 'CYBERSECURITY_CLOUD',
};

export function FeaturedCourses() {
  const [active, setActive] = useState('All');
  const params: Record<string, string> = { pageSize: '6' };
  if (active === 'All') params.featured = 'true';
  else params.category = FILTER_MAP[active];

  const { data: res, isLoading } = useCourses(params);
  const courses = (res as any)?.data ?? [];
  const total    = (res as any)?.total ?? 0;

  return (
    <section className="py-20 bg-brand-ice">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="section-label">Our Courses</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="section-title mt-2">
            Sabhi Courses Sirf <span>Rs 399</span> Mein
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-gray-500 mt-3 max-w-xl mx-auto">
            Professional-grade content in Hindi. Certificate included. Lifetime access.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((f) => (
            <motion.button key={f} whileTap={{ scale: 0.95 }}
              onClick={() => setActive(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                active === f
                  ? 'bg-brand-blue text-white shadow-blue'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-orange hover:text-brand-orange'
              }`}>
              {f}
            </motion.button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-brand-blue animate-spin" /></div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No courses in this category yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any, i: number) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mt-12">
          <Link href="/courses" className="btn-primary inline-flex">
            View All {total > 0 ? total : ''} Courses <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
