'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useUserStats, useMyEnrollments, usePlatformStats } from '@/hooks/use-queries';
import { DashboardStatsSkeleton } from '@/components/common/skeletons';
import { xpToLevel, formatDate } from '@/lib/utils';
import { Play, Award, Flame, Star, TrendingUp, BookOpen, Clock, ChevronRight, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { data: session }    = useSession();
  const { data: platformStats } = usePlatformStats();
  const { data: stats,  isLoading: statsLoading }  = useUserStats();
  const { data: enrollRes, isLoading: enrollLoading } = useMyEnrollments();

  const enrollments = (enrollRes as any)?.data ?? enrollRes ?? [];
  const userName    = session?.user?.name?.split(' ')[0] ?? 'Student';
  const xp          = stats?.xpPoints ?? 0;
  const { level, label: levelLabel, progress: xpProgress, nextXp } = xpToLevel(xp);

  return (
    <>
      <main className="min-h-screen bg-brand-ice pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Welcome banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-mesh rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="font-heading font-bold text-2xl md:text-3xl mb-1">
                  Hi, {userName}! 👋
                </h1>
                <p className="text-white/70">Continue your learning journey. You're doing great!</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <Flame size={14} className="text-brand-orange" />
                    <span className="text-sm font-semibold">{stats?.streakDays ?? 0} day streak</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-sm font-semibold">{xp} XP</span>
                  </div>
                </div>
              </div>

              {/* XP progress */}
              <div className="bg-white/10 rounded-2xl p-5 min-w-52 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">Level {level} — {levelLabel}</span>
                  <span className="text-xs text-white/60">Level {level + 1}</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-brand-orange rounded-full" />
                </div>
                <div className="text-xs text-white/60">{xp} / {nextXp} XP to next level</div>
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          {statsLoading ? <DashboardStatsSkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: BookOpen, label: 'Enrolled',     value: stats?.enrolledCourses  ?? 0, color: 'text-brand-blue',   bg: 'bg-blue-50' },
                { icon: Award,    label: 'Completed',    value: stats?.completedCourses ?? 0, color: 'text-brand-green',  bg: 'bg-green-50' },
                { icon: Star,     label: 'Certificates', value: stats?.certificates     ?? 0, color: 'text-yellow-600',   bg: 'bg-yellow-50' },
                { icon: Zap,      label: 'XP Points',   value: stats?.xpPoints         ?? 0, color: 'text-brand-orange', bg: 'bg-orange-50' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <div className="font-heading font-bold text-2xl text-gray-900">{s.value}</div>
                  <div className="text-gray-500 text-sm">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enrolled courses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading font-bold text-gray-900 text-xl">Continue Learning</h2>
                <Link href="/dashboard/my-courses" className="text-brand-blue text-sm font-semibold hover:text-brand-orange transition-colors">
                  View all →
                </Link>
              </div>

              {enrollLoading ? (
                <div className="space-y-4">
                  {[1,2].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
                </div>
              ) : enrollments.length > 0 ? (
                enrollments.slice(0, 3).map((enroll: any, i: number) => {
                  const course = enroll.course ?? enroll;
                  const progress = enroll.progress ?? 0;
                  return (
                    <motion.div key={enroll.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 hover:shadow-card-hover transition-all">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                          <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Clock size={12} /> Enrolled {formatDate(enroll.enrolledAt ?? new Date().toISOString())}
                          </p>
                        </div>
                        <Link href={course.firstLessonId ? `/learn/${course.slug}/${course.firstLessonId}` : `/courses/${course.slug}`}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-brand-orange text-white text-sm font-semibold px-4 py-2 rounded-full shadow-orange hover:bg-brand-orange-light transition-all flex-shrink-0">
                            <Play size={13} fill="white" /> Resume
                          </motion.button>
                        </Link>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                            className="h-full bg-brand-green rounded-full" />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 flex-shrink-0">{Math.round(progress)}%</span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100 text-center">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="font-semibold text-gray-700 mb-2">No courses yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Enroll in your first course to start learning</p>
                  <Link href="/courses" className="btn-primary inline-flex text-sm">Browse Courses</Link>
                </div>
              )}

              <Link href="/courses" className="flex items-center justify-between bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-5 hover:bg-brand-blue/10 transition-colors group">
                <div>
                  <div className="font-semibold text-brand-blue">Explore More Courses</div>
                  <div className="text-gray-500 text-sm">
                    {(platformStats as any)?.totalCourses > 0 ? `${(platformStats as any).totalCourses}+ courses at Rs 399 each` : 'Fresh courses added regularly'}
                  </div>
                </div>
                <ChevronRight size={20} className="text-brand-blue group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Weekly Goal */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h3 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-brand-green" /> Weekly Goal
                </h3>
                {(() => {
                  const completed = stats?.weeklyGoal?.completed ?? 0;
                  const target    = stats?.weeklyGoal?.target ?? 3;
                  const pct       = Math.min(100, Math.round((completed / target) * 100));
                  const hitGoal   = completed >= target;
                  return (
                    <>
                      <div className="text-center mb-4">
                        <div className="font-heading font-bold text-4xl text-brand-blue">{completed}<span className="text-gray-400 text-xl">/{target}</span></div>
                        <div className="text-gray-500 text-sm">lessons this week</div>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className={`h-full rounded-full transition-all duration-700 ${hitGoal ? 'bg-brand-green' : 'bg-brand-blue'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-gray-500 text-xs text-center">
                        {hitGoal ? 'Goal reached this week! 🎉' : `Complete ${target - completed} more lesson${target - completed === 1 ? '' : 's'} to hit your goal 🎯`}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
                <h3 className="font-heading font-semibold text-gray-900 mb-4">Quick Links</h3>
                {[
                  { label: 'My Certificates',  href: '/dashboard/certificates', icon: Award },
                  { label: 'Progress Report',  href: '/dashboard/progress',     icon: TrendingUp },
                  { label: 'Leaderboard',      href: '/dashboard/leaderboard',  icon: Star },
                  { label: 'Career Quiz',      href: '/career-quiz',            icon: Zap },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 py-2.5 text-gray-700 hover:text-brand-orange transition-colors group">
                    <item.icon size={15} className="text-gray-400 group-hover:text-brand-orange transition-colors" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <ChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-brand-orange transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
