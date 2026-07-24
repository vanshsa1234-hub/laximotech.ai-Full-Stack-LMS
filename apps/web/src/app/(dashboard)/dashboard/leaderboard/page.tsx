'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Award, Flame } from 'lucide-react';
import { useLeaderboard } from '@/hooks/use-queries';

const MEDAL: Record<number,string> = {1:'🥇',2:'🥈',3:'🥉'};
const RANK_BG: Record<number,string> = {
  1:'bg-yellow-500/10 border-yellow-500/30',
  2:'bg-gray-400/10 border-gray-400/30',
  3:'bg-orange-500/10 border-orange-600/30',
};

export default function LeaderboardPage() {
  const { data: res, isLoading } = useLeaderboard();
  const board: any[] = (res as any) ?? [];
  const top3 = board.slice(0,3);
  const rest  = board.slice(3);

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 text-2xl mb-2 flex items-center gap-2">
          <Trophy size={24} className="text-yellow-500"/> Leaderboard
        </h1>
        <p className="text-gray-500 text-sm mb-8">Top learners by XP points this week</p>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className="skeleton h-16 rounded-2xl"/>)}</div>
        ) : board.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-card">
            <Trophy size={48} className="text-gray-200 mx-auto mb-4"/>
            <h3 className="font-semibold text-gray-700 mb-2">No entries yet</h3>
            <p className="text-gray-400 text-sm">Complete lessons to earn XP and appear here!</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[top3[1],top3[0],top3[2]].map((s,i)=>{
                  if(!s) return <div key={i}/>;
                  const heights=['h-24','h-32','h-20'];
                  return (
                    <motion.div key={s.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
                      className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-lg mb-2">
                        {(s.name??'U')[0]}
                      </div>
                      <div className="font-semibold text-gray-900 text-xs text-center mb-1 truncate w-full">{s.name}</div>
                      <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                        <Zap size={10} className="text-brand-orange"/> {s.xpPoints} XP
                      </div>
                      <div className={`w-full ${heights[i]} rounded-t-xl flex items-center justify-center text-3xl ${RANK_BG[[2,1,3][i]] ?? 'bg-gray-100'} border border-b-0`}>
                        {MEDAL[[2,1,3][i]]}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full table */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span className="col-span-1">#</span>
                <span className="col-span-6">Student</span>
                <span className="col-span-2 text-right">XP</span>
                <span className="col-span-2 text-right">Streak</span>
                <span className="col-span-1 text-right">🏅</span>
              </div>
              {board.map((s:any,i:number)=>(
                <motion.div key={s.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                  className={`px-5 py-3 grid grid-cols-12 items-center border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    i<3?`${RANK_BG[i+1]} border-l-2 ${i===0?'border-l-yellow-400':i===1?'border-l-gray-400':'border-l-orange-400'}`:''}
                  `}>
                  <span className="col-span-1 font-bold text-gray-400 text-sm">{i<3?MEDAL[i+1]:i+1}</span>
                  <div className="col-span-6 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-sm font-bold flex-shrink-0">
                      {(s.name??'U')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{s.name}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right font-bold text-brand-orange text-sm">{s.xpPoints}</div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-1 text-sm text-gray-500">
                    <Flame size={12} className="text-brand-orange"/> {s.streakDays??0}d
                  </div>
                  <div className="col-span-1 text-right flex items-center justify-end gap-1 text-sm text-gray-500">
                    <Award size={12} className="text-yellow-500"/> {s._count?.certificates??0}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
        <p className="text-center text-xs text-gray-400 mt-6">Updated every hour · XP from lessons, quizzes and certificates</p>
      </div>
    </main>
  );
}
