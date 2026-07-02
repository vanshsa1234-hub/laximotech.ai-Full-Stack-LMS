'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { EnrollButton } from '@/components/payment/enroll-button';
import { useCourse, useEnrollmentCheck } from '@/hooks/use-queries';
import { CourseCardSkeleton } from '@/components/common/skeletons';
import { CATEGORY_LABELS, formatHours } from '@/lib/utils';
import {
  Play, Clock, BookOpen, Users, Star, Check, ChevronDown, ChevronUp,
  Award, Globe, Smartphone, Infinity, Lock
} from 'lucide-react';

const contentTypeIcon: Record<string, React.ReactNode> = {
  VIDEO: <Play size={12} />, QUIZ: <Award size={12} />, CODE: <BookOpen size={12} />,
};

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const { data: course, isLoading } = useCourse(params.slug);
  const { data: enrollData } = useEnrollmentCheck(course?.id ?? '');
  const [openSection, setOpenSection] = useState<string | null>(null);
  const isEnrolled = (enrollData as any)?.enrolled ?? false;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-brand-ice pt-24">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-4">
                <div className="skeleton h-10 w-3/4 rounded-xl" />
                <div className="skeleton h-5 w-full rounded-xl" />
                <div className="skeleton h-5 w-2/3 rounded-xl" />
              </div>
              <CourseCardSkeleton />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!course) return null;

  const avgRating = (course as any).avgRating ?? 4.8;
  const firstLessonId = ((course as any).sections ?? []).flatMap((section: any) => section.lessons ?? []).find((lesson: any) => lesson?.id)?.id ?? '';
  const continueHref = firstLessonId ? `/learn/${course.slug}/${firstLessonId}` : `/courses/${course.slug}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        {/* Hero */}
        <div className="bg-mesh pt-24 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="inline-block bg-brand-orange/20 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-4">
                    {CATEGORY_LABELS[course.category] ?? course.category}
                  </span>
                  <h1 className="font-heading font-bold text-white text-3xl md:text-4xl mb-4 leading-tight">{course.title}</h1>
                  <p className="text-white/75 text-base mb-6 leading-relaxed">{course.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-6">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} className="fill-yellow-400 text-yellow-400" />)}
                      <span className="text-white ml-1 font-semibold">{avgRating.toFixed(1)}</span>
                      <span>({(course as any)._count?.reviews ?? 0} reviews)</span>
                    </div>
                    <span className="flex items-center gap-1"><Users size={14} /> {((course as any)._count?.enrollments ?? 0).toLocaleString('en-IN')} students</span>
                    <span className="flex items-center gap-1"><Globe size={14} /> {course.language}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {course.durationHrs}h</span>
                  </div>

                  <div className="flex items-center gap-3 text-white/80">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center text-lg">👨</div>
                    <div>
                      <div className="font-semibold text-white text-sm">{(course as any).instructor?.name}</div>
                      <div className="text-white/60 text-xs">{(course as any).instructor?.bio}</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sticky enroll card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="hidden lg:block bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 sticky top-24">
                <div className="relative h-44 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 rounded-xl overflow-hidden mb-5 flex items-center justify-center">
                  <div className="text-6xl">🤖</div>
                </div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="font-heading font-bold text-4xl text-brand-blue">Rs {course.price}</span>
                  <span className="text-gray-400 line-through text-lg mb-1">Rs 4,999</span>
                  <span className="text-brand-green text-sm font-bold mb-1">92% off</span>
                </div>
                <p className="text-red-500 text-xs mb-4 font-semibold animate-pulse">⏰ Limited time offer!</p>

                {isEnrolled ? (
                  <a href={continueHref}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-bold py-4 rounded-full hover:opacity-90 transition-opacity mb-4">
                    <Play size={16} fill="white" /> Continue Learning
                  </a>
                ) : (
                  <EnrollButton courseId={course.id} courseSlug={course.slug} price={course.price} courseTitle={course.title} />
                )}

                <div className="mt-4 space-y-2">
                  {[[Infinity,'Lifetime access'],[Smartphone,'Mobile + Desktop'],[Award,'Certificate'],[Check,'30-day refund']].map(([Icon, text], i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-500 text-xs">
                      <span className="text-brand-green">✓</span> {text as string}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* Curriculum */}
              {(course as any).sections && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
                  <div className="p-6 border-b border-gray-50">
                    <h2 className="font-heading font-bold text-gray-900 text-xl">Course Curriculum</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {(course as any).sections?.length} sections · {course.totalLessons} lessons · {formatHours(course.durationHrs)} total
                    </p>
                  </div>
                  {(course as any).sections?.map((section: any) => (
                    <div key={section.id} className="border-b border-gray-50 last:border-0">
                      <button onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
                          <span className="text-xs text-gray-400">{section.lessons?.length} lessons</span>
                        </div>
                        {openSection === section.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                      </button>
                      <AnimatePresence>
                        {openSection === section.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            {section.lessons?.map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center justify-between px-6 py-3 bg-gray-50/50 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${lesson.isPreview ? 'bg-brand-orange/10 text-brand-orange' : 'bg-gray-100 text-gray-400'}`}>
                                    {lesson.isPreview ? (contentTypeIcon[lesson.contentType] ?? <Play size={10} />) : <Lock size={10} />}
                                  </div>
                                  <span className="text-gray-700 text-sm">{lesson.title}</span>
                                  {lesson.isPreview && <span className="text-xs text-brand-orange font-semibold bg-brand-orange/10 px-2 py-0.5 rounded-full">Free</span>}
                                </div>
                                <span className="text-gray-400 text-xs">{lesson.estimatedMinutes}m</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-1" />
          </div>
        </div>

        {/* Mobile sticky bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex items-center justify-between gap-4">
          <div>
            <div className="font-heading font-bold text-brand-blue text-2xl">Rs {course.price}</div>
            <div className="text-xs text-gray-400 line-through">Rs 4,999</div>
          </div>
          {isEnrolled
            ? <a href={continueHref} className="flex-1 btn-primary justify-center py-3">Continue Learning</a>
            : <EnrollButton courseId={course.id} courseSlug={course.slug} price={course.price} courseTitle={course.title} className="flex-1" />}
        </div>
      </main>
      <Footer />
    </>
  );
}
