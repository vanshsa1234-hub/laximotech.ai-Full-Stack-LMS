'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TrendingUp, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { useCareerPaths } from '@/hooks/use-queries';

const EMOJI: Record<string,string> = {'become-ai-engineer':'🤖','become-data-analyst':'📊','become-cybersecurity-expert':'🔒','become-iot-developer':'⚡','become-full-stack-developer':'💻'};
const COLORS: Record<string,string> = {'become-ai-engineer':'from-purple-600 to-blue-600','become-data-analyst':'from-blue-600 to-cyan-500','become-cybersecurity-expert':'from-red-600 to-orange-500','become-iot-developer':'from-green-600 to-teal-500','become-full-stack-developer':'from-indigo-600 to-purple-600'};

export default function PathsPage() {
  const { data: res, isLoading } = useCareerPaths();
  const paths: any[] = (res as any) ?? [];

  return (
    <>
      <Navbar/>
      <main className="min-h-screen bg-brand-ice">
        <div className="bg-mesh pt-28 pb-14 text-center">
          <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">
            Career <span className="text-brand-orange">Paths</span>
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Confused where to start? Choose a career goal — we guide you step by step.</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i=><div key={i} className="skeleton h-56 rounded-2xl"/>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paths.map((path:any,i:number)=>(
                <motion.div key={path.slug} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="group">
                  <Link href={`/paths/${path.slug}`}>
                    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
                      <div className={`h-2 bg-gradient-to-r ${COLORS[path.slug]??'from-brand-blue to-purple-600'}`}/>
                      <div className="p-6">
                        {path.iconUrl ? (
                          <div className="relative w-12 h-12 mb-4 rounded-xl overflow-hidden">
                            <Image src={path.iconUrl} alt={path.title} fill className="object-cover" />
                          </div>
                        ) : (
                          <div className="text-4xl mb-4">{EMOJI[path.slug]??'🎯'}</div>
                        )}
                        <h2 className="font-heading font-bold text-gray-900 text-xl mb-2 group-hover:text-brand-orange transition-colors">{path.title}</h2>
                        <p className="text-gray-500 text-sm mb-4">{path.description}</p>
                        <div className="flex flex-wrap gap-3 mb-4">
                          <span className="flex items-center gap-1.5 text-brand-green text-sm font-semibold">
                            <TrendingUp size={14}/> {path.avgSalary}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <BookOpen size={12}/> {path.courses?.length??0} courses
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                          <span className="text-xs text-gray-400">All at Rs 399/course</span>
                          <span className="flex items-center gap-1 text-brand-blue text-sm font-semibold group-hover:text-brand-orange transition-colors">
                            View Path <ArrowRight size={14}/>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10 bg-gradient-to-br from-brand-blue to-purple-700 rounded-2xl p-8 text-white text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-heading font-bold text-xl mb-2">Not Sure Which Path?</h3>
            <p className="text-white/70 text-sm mb-5">Take our AI career quiz — 5 questions, instant recommendation.</p>
            <Link href="/career-quiz" className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-6 py-3 rounded-full shadow-orange hover:bg-brand-orange-light transition-all">
              Take Career Quiz <ArrowRight size={15}/>
            </Link>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
