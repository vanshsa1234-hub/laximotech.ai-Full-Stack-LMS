'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Play, Clock, CheckCircle, BookOpen, Star, Loader2 } from 'lucide-react';
import { useMyEnrollments, useMyReview, useUpsertReview } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

function RateCourse({ courseId }: { courseId: string }) {
  const { data: myReview, isLoading } = useMyReview(courseId);
  const upsertReview = useUpsertReview();
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const existingRating = (myReview as any)?.rating;
  const activeRating = selectedRating || existingRating || 0;

  // Clicking a star only picks the rating and opens the comment box —
  // it does NOT submit. Submission only happens on explicit Save, so the
  // box no longer closes on its own before the user can type a comment.
  const pickStar = (s: number) => {
    setSelectedRating(s);
    setShowComment(true);
  };

  const save = () => {
    const rating = selectedRating || existingRating;
    if (!rating) return;
    upsertReview.mutate({ courseId, data: { rating, comment: comment.trim() || undefined } }, {
      onSuccess: () => { toast.success('Thanks for rating this course!'); setShowComment(false); },
      onError:   () => toast.error('Failed to submit rating.'),
    });
  };

  if (isLoading) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-50">
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button"
            onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}
            onClick={() => pickStar(s)}
            disabled={upsertReview.isPending}>
            <Star size={16} className={
              (hoverRating || activeRating) >= s ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
            } />
          </button>
        ))}
        <span className="text-xs text-gray-500 ml-2">
          {existingRating ? 'Your rating — click to change' : 'Rate this course'}
        </span>
        {upsertReview.isPending && <Loader2 size={12} className="animate-spin text-gray-400 ml-1" />}
      </div>
      {showComment && (
        <div className="mt-2 flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            disabled={upsertReview.isPending}
            className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-brand-orange disabled:opacity-50" />
          <button onClick={save} disabled={upsertReview.isPending}
            className="text-xs font-semibold text-brand-blue hover:text-brand-orange transition-colors flex-shrink-0 disabled:opacity-50">
            Save
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyCoursesPage() {
  const { data: res, isLoading } = useMyEnrollments();
  const enrollments = (res as any)?.data ?? res ?? [];
  const active    = enrollments.filter((e: any) => e.progress < 100);
  const completed = enrollments.filter((e: any) => e.progress >= 100);

  const EMOJI: Record<string,string> = {
    AI_ML:'🤖', DATA_SCIENCE:'📊', PROGRAMMING:'💻', ROBOTICS_IOT:'⚡', CYBERSECURITY_CLOUD:'🔒',
  };

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 text-2xl mb-8">My Courses</h1>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="skeleton h-28 rounded-2xl"/>)}</div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
            <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-gray-700 text-lg mb-2">No courses yet</h3>
            <p className="text-gray-400 text-sm mb-6">Enroll in your first course to get started</p>
            <Link href="/courses" className="btn-primary inline-flex">Browse Courses</Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div className="mb-10">
                <h2 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-4">In Progress ({active.length})</h2>
                <div className="space-y-4">
                  {active.map((enroll: any, i: number) => {
                    const course = enroll.course ?? {};
                    return (
                      <motion.div key={enroll.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:shadow-card-hover transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-brand-blue/10 flex items-center justify-center text-2xl flex-shrink-0">
                            {EMOJI[course.category] ?? '📚'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{course.title}</h3>
                            <p className="text-gray-500 text-sm flex items-center gap-3 mb-3">
                              <span className="flex items-center gap-1"><BookOpen size={12}/> {course.totalLessons} lessons</span>
                              <span className="flex items-center gap-1"><Clock size={12}/> {course.durationHrs}h</span>
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div initial={{width:0}} animate={{width:`${enroll.progress}%`}}
                                  transition={{delay:0.3+i*0.1,duration:0.8}}
                                  className="h-full bg-brand-green rounded-full"/>
                              </div>
                              <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{Math.round(enroll.progress)}%</span>
                            </div>
                          </div>
                          <Link href={course.firstLessonId ? `/learn/${course.slug}/${course.firstLessonId}` : `/courses/${course.slug}`} className="flex-shrink-0">
                            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}}
                              className="flex items-center gap-2 bg-brand-orange text-white font-semibold text-sm px-4 py-2.5 rounded-full shadow-orange">
                              <Play size={13} fill="white"/> Resume
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-600 text-sm uppercase tracking-wider mb-4">Completed ({completed.length})</h2>
                <div className="space-y-4">
                  {completed.map((enroll: any, i: number) => {
                    const course = enroll.course ?? {};
                    return (
                      <motion.div key={enroll.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                        className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-brand-green/10 flex items-center justify-center text-2xl flex-shrink-0">
                            {EMOJI[course.category] ?? '📚'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                            <div className="flex items-center gap-2 text-brand-green text-sm font-semibold">
                              <CheckCircle size={14}/> Completed {enroll.completedAt ? formatDate(enroll.completedAt) : ''}
                            </div>
                          </div>
                          <Link href={course.firstLessonId ? `/learn/${course.slug}/${course.firstLessonId}` : `/courses/${course.slug}`}
                            className="text-brand-blue text-sm font-semibold hover:text-brand-orange transition-colors flex-shrink-0">
                            Review →
                          </Link>
                        </div>
                        <RateCourse courseId={course.id} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/courses" className="btn-primary inline-flex">Browse More Courses</Link>
        </div>
      </div>
    </main>
  );
}