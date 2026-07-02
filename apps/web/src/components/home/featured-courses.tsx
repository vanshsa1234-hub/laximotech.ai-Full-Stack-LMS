'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CourseCard } from '@/components/courses/course-card';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Course } from '@/types';

const MOCK_COURSES: Course[] = [
  {
    id: '1', slug: 'ai-machine-learning-hindi', title: 'AI & Machine Learning — Hindi',
    description: 'India ka sabse comprehensive AI/ML course.', shortDesc: 'Python se Deep Learning tak — Hindi mein. Job-ready AI engineer banein.',
    thumbnailUrl: null, previewVideo: null, price: 399, level: 'BEGINNER', category: 'AI_ML',
    language: 'Hindi + English', durationHrs: 42, totalLessons: 16, isPublished: true, isFeatured: true,
    instructor: { id: 'i1', name: 'Rahul Sharma', image: null },
    tags: [], avgRating: 4.9, _count: { enrollments: 3200, reviews: 480 }, createdAt: '',
  },
  {
    id: '2', slug: 'data-science-beginners-hindi', title: 'Data Science for Beginners — Hindi',
    description: '', shortDesc: 'Statistics, Python, SQL aur Viz — data scientist banein Rs 399 mein.',
    thumbnailUrl: null, previewVideo: null, price: 399, level: 'BEGINNER', category: 'DATA_SCIENCE',
    language: 'Hindi + English', durationHrs: 38, totalLessons: 16, isPublished: true, isFeatured: true,
    instructor: { id: 'i1', name: 'Rahul Sharma', image: null },
    tags: [], avgRating: 4.8, _count: { enrollments: 2800, reviews: 390 }, createdAt: '',
  },
  {
    id: '3', slug: 'python-programming-hindi', title: 'Python Programming — Zero to Hero',
    description: '', shortDesc: 'Bilkul zero se Python expert — beginner-friendly, Hindi mein.',
    thumbnailUrl: null, previewVideo: null, price: 399, level: 'BEGINNER', category: 'PROGRAMMING',
    language: 'Hindi + English', durationHrs: 30, totalLessons: 16, isPublished: true, isFeatured: false,
    instructor: { id: 'i1', name: 'Rahul Sharma', image: null },
    tags: [], avgRating: 4.7, _count: { enrollments: 2100, reviews: 310 }, createdAt: '',
  },
  {
    id: '4', slug: 'cybersecurity-ethical-hacking-hindi', title: 'Cybersecurity & Ethical Hacking',
    description: '', shortDesc: 'Ethical hacking, network security, pentesting — legally sikhein.',
    thumbnailUrl: null, previewVideo: null, price: 399, level: 'INTERMEDIATE', category: 'CYBERSECURITY_CLOUD',
    language: 'Hindi + English', durationHrs: 40, totalLessons: 16, isPublished: true, isFeatured: true,
    instructor: { id: 'i1', name: 'Rahul Sharma', image: null },
    tags: [], avgRating: 4.8, _count: { enrollments: 1900, reviews: 260 }, createdAt: '',
  },
  {
    id: '5', slug: 'iot-robotics-arduino-hindi', title: 'IoT & Robotics with Arduino',
    description: '', shortDesc: 'Arduino + Raspberry Pi se real robots aur smart devices banao.',
    thumbnailUrl: null, previewVideo: null, price: 399, level: 'INTERMEDIATE', category: 'ROBOTICS_IOT',
    language: 'Hindi + English', durationHrs: 35, totalLessons: 16, isPublished: true, isFeatured: false,
    instructor: { id: 'i1', name: 'Rahul Sharma', image: null },
    tags: [], avgRating: 4.6, _count: { enrollments: 1400, reviews: 190 }, createdAt: '',
  },
];

const FILTERS = ['All', 'AI & ML', 'Data Science', 'Programming', 'Robotics', 'Cybersecurity'];
const FILTER_MAP: Record<string, string> = {
  'AI & ML': 'AI_ML', 'Data Science': 'DATA_SCIENCE',
  'Programming': 'PROGRAMMING', 'Robotics': 'ROBOTICS_IOT', 'Cybersecurity': 'CYBERSECURITY_CLOUD',
};

export function FeaturedCourses() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? MOCK_COURSES : MOCK_COURSES.filter(c => c.category === FILTER_MAP[active]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mt-12">
          <Link href="/courses" className="btn-primary inline-flex">
            View All 25 Courses <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
