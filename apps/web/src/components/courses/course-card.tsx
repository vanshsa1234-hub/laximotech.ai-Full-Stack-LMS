'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Clock, Users, Play, BookOpen } from 'lucide-react';
import { useRef } from 'react';
import type { Course } from '@/types';

const categoryColors: Record<string, string> = {
  AI_ML:               'bg-purple-100 text-purple-700',
  DATA_SCIENCE:        'bg-blue-100 text-blue-700',
  PROGRAMMING:         'bg-green-100 text-green-700',
  ROBOTICS_IOT:        'bg-orange-100 text-orange-700',
  CYBERSECURITY_CLOUD: 'bg-red-100 text-red-700',
};

const categoryLabels: Record<string, string> = {
  AI_ML:               'AI & ML',
  DATA_SCIENCE:        'Data Science',
  PROGRAMMING:         'Programming',
  ROBOTICS_IOT:        'Robotics & IoT',
  CYBERSECURITY_CLOUD: 'Cybersecurity',
};

const levelColors: Record<string, string> = {
  BEGINNER:     'text-green-600',
  INTERMEDIATE: 'text-yellow-600',
  ADVANCED:     'text-red-600',
};

interface CourseCardProps {
  course: Course;
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const cardRef   = useRef<HTMLDivElement>(null);
  const mouseX    = useMotionValue(0);
  const mouseY    = useMotionValue(0);
  const rotateX   = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]),  { stiffness: 300, damping: 30 });
  const rotateY   = useSpring(useTransform(mouseX, [-0.5, 0.5], [-4, 4]),  { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      className="group"
    >
      <Link href={`/courses/${course.slug}`}>
        <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-44 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 overflow-hidden flex-shrink-0">
            {course.thumbnailUrl ? (
              <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-30">
                  {{ AI_ML: '🤖', DATA_SCIENCE: '📊', PROGRAMMING: '💻', ROBOTICS_IOT: '🤖', CYBERSECURITY_CLOUD: '🔒' }[course.category] ?? '📚'}
                </div>
              </div>
            )}

            {/* Price badge */}
            <div className="absolute top-3 right-3 bg-brand-orange text-white font-heading font-bold text-sm px-3 py-1 rounded-full shadow-orange animate-glow-pulse">
              Rs {course.price}
            </div>

            {/* Category pill */}
            <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[course.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {categoryLabels[course.category]}
            </div>

            {/* Play overlay */}
            {course.previewVideo && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play size={20} className="text-brand-orange fill-brand-orange ml-0.5" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-heading font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
              {course.shortDesc}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {course.durationHrs}h
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={12} /> {course.totalLessons} lessons
              </span>
              {course._count?.enrollments && (
                <span className="flex items-center gap-1">
                  <Users size={12} /> {course._count.enrollments.toLocaleString('en-IN')}
                </span>
              )}
              <span className={`font-medium ${levelColors[course.level]}`}>
                {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
              </span>
            </div>

            {/* Rating + CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={12} className={(course.avgRating ?? 4.8) >= s ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                ))}
                <span className="text-xs text-gray-500 ml-1">{(course.avgRating ?? 4.8).toFixed(1)}</span>
              </div>
              <span className="text-brand-blue text-xs font-semibold group-hover:text-brand-orange transition-colors">
                View Course →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
