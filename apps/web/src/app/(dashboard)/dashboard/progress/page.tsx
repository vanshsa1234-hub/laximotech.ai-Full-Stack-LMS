'use client';

import { motion } from 'framer-motion';
import { BarChart2, Clock, Zap, Flame, CheckCircle, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useUserStats, useMyEnrollments, useActivityHeatmap } from '@/hooks/use-queries';

const LEVEL_COLORS = ['bg-gray-100','bg-brand-green/30','bg-brand-green/60','bg-brand-green'];

// Map a real completion count for a day to a heatmap intensity level (0-3).
// Returns an index directly into LEVEL_COLORS (0 = no activity) — previously
// this returned -1 and callers did LEVEL_COLORS[level+1], which read
// LEVEL_COLORS[4] (out of bounds, undefined) for the highest activity level.
function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3; // 3+ lessons in a day
}

export default function ProgressPage() {
  const { data: stats,  isLoading: statsLoading }  = useUserStats();
  const { data: enrRes, isLoading: enrLoading }    = useMyEnrollments();
  const { data: activity, isLoading: activityLoading, isError: activityError, refetch: refetchActivity } = useActivityHeatmap();
  const enrollments = (enrRes as any)?.data ?? enrRes ?? [];
  const activityDays = (activity as any[]) ?? [];

  // Real numbers from the backend (summed actual watchedSeconds / actual completed
  // LessonProgress rows) — not estimated from course.durationHrs * progress%,
  // which could drift from what was actually watched.
  const totalHrs     = stats?.totalWatchedHrs ?? 0;
  const totalLessons = stats?.completedLessons ?? 0;

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 text-2xl mb-8 flex items-center gap-2">
          <BarChart2 size={24} className="text-brand-blue"/> My Progress
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {icon:Clock,      label:'Hours Watched', value:statsLoading?'...':`${totalHrs.toFixed(1)}h`, color:'text-brand-blue',   bg:'bg-blue-50'},
            {icon:CheckCircle,label:'Lessons Done',  value:statsLoading?'...':totalLessons,              color:'text-brand-green',  bg:'bg-green-50'},
            {icon:Award,      label:'Certificates',  value:statsLoading?'...':(stats?.certificates??0),  color:'text-yellow-600',   bg:'bg-yellow-50'},
            {icon:Zap,        label:'Total XP',      value:statsLoading?'...':(stats?.xpPoints??0),      color:'text-brand-orange', bg:'bg-orange-50'},
          ].map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              className="bg-white rounded-2xl p-5 shadow-card border border-gray-100">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={18} className={s.color}/>
              </div>
              <div className="font-heading font-bold text-2xl text-gray-900">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Course progress bars */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
            className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
            <h2 className="font-heading font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-blue"/> Course Progress
            </h2>
            {enrLoading ? (
              <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="skeleton h-10 rounded-lg"/>)}</div>
            ) : enrollments.length === 0 ? (
              <p className="text-gray-400 text-sm">No courses enrolled yet.</p>
            ) : (
              <div className="space-y-5">
                {enrollments.map((e:any,i:number)=>(
                  <div key={e.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800 truncate flex-1 mr-4">{e.course?.title}</span>
                      <span className={`text-sm font-bold flex-shrink-0 ${e.progress>=100?'text-brand-green':'text-brand-blue'}`}>{Math.round(e.progress)}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{width:0}} animate={{width:`${e.progress}%`}}
                        transition={{delay:0.3+i*0.1,duration:0.8}}
                        className={`h-full rounded-full ${e.progress>=100?'bg-brand-green':'bg-brand-blue'}`}/>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{e.course?.totalLessons} lessons · {e.course?.durationHrs}h</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Activity heatmap — real lesson-completion data, not random */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
            className="bg-white rounded-2xl p-6 shadow-card border border-gray-100">
            <h2 className="font-heading font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Flame size={18} className="text-brand-orange"/> Activity — Last 12 Weeks
            </h2>
            {activityLoading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
            ) : activityError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-gray-400 text-sm">Couldn't load your activity right now.</p>
                <button onClick={() => refetchActivity()} className="text-brand-blue text-sm font-semibold hover:text-brand-orange transition-colors">
                  Try again
                </button>
              </div>
            ) : activityDays.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No activity recorded yet — complete a lesson to get started.</p>
            ) : (
              <div className="flex gap-1 flex-wrap">
                {activityDays.map((day, i) => {
                  const level = levelFor(day.count);
                  return (
                    <motion.div key={day.date} initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}}
                      transition={{delay:i*0.004}}
                      className={`w-3 h-3 rounded-sm ${LEVEL_COLORS[level]}`}
                      title={`${day.date}: ${day.count > 0 ? `${day.count} lesson${day.count > 1 ? 's' : ''} completed` : 'No activity'}`}/>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-xs text-gray-400">Less</span>
              {LEVEL_COLORS.map((c,i)=><div key={i} className={`w-3 h-3 rounded-sm ${c}`}/>)}
              <span className="text-xs text-gray-400">More</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-brand-orange">
                <Flame size={14}/> <span className="font-bold">{stats?.streakDays??0}</span> day streak
              </div>
              <div className="flex items-center gap-1.5 text-brand-blue">
                <Zap size={14}/> <span className="font-bold">{stats?.xpPoints??0}</span> XP total
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
