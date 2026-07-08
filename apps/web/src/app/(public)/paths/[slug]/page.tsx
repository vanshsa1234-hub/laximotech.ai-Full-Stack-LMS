'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/courses/course-card';
import { TrendingUp, ArrowLeft, Clock, BookOpen, Award, ChevronRight } from 'lucide-react';
import { useCareerPath } from '@/hooks/use-queries';

const EMOJI: Record<string,string> = {'become-ai-engineer':'🤖','become-data-analyst':'📊','become-cybersecurity-expert':'🔒','become-iot-developer':'⚡','become-full-stack-developer':'💻'};

export default function CareerPathPage({ params }: { params: { slug: string } }) {
  const { data: path, isLoading } = useCareerPath(params.slug);

  if (isLoading) return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-brand-ice pt-24">
        <div className="bg-mesh h-64"/>
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
          {[1,2,3].map(i=><div key={i} className="skeleton h-48 rounded-2xl"/>)}
        </div>
      </div>
      <Footer/>
    </>
  );

  if (!path) return null;
  const p = path as any;
  const courses = p.courses ?? [];
  const totalPrice = courses.length * 399;

  return (
    <>
      <Navbar/>
      <main className="min-h-screen bg-brand-ice">
        <div className="bg-mesh pt-28 pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/paths" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={14}/> All Career Paths
            </Link>
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
              {p.iconUrl ? (
                <div className="relative w-16 h-16 mb-4 rounded-2xl overflow-hidden border border-white/20">
                  <Image src={p.iconUrl} alt={p.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="text-5xl mb-4">{EMOJI[params.slug]??'🎯'}</div>
              )}
              <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-4">{p.title}</h1>
              <p className="text-white/75 text-lg max-w-2xl mb-8 leading-relaxed">{p.description}</p>
              <div className="flex flex-wrap gap-4">
                {[
                  {icon:TrendingUp, text:p.avgSalary,             label:'Avg Salary'},
                  {icon:BookOpen,   text:`${courses.length} courses`,label:'Courses'},
                  {icon:Award,      text:`${courses.length} certs`, label:'Certificates'},
                ].map((item,i)=>(
                  <div key={i} className="glass rounded-xl px-5 py-3">
                    <div className="text-white/60 text-xs mb-0.5">{item.label}</div>
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <item.icon size={14} className="text-brand-orange"/> {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h2 className="font-heading font-bold text-gray-900 text-2xl mb-2">Your Roadmap</h2>
            <p className="text-gray-500 mb-8">Follow these courses in order for the best learning experience</p>
            <div className="relative">
              <div className="hidden md:block absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-brand-blue via-brand-orange to-brand-green"/>
              <div className="space-y-6">
                {courses.map((item:any,i:number)=>(
                  <motion.div key={item.id||i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.15}}
                    className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-blue text-white font-heading font-bold text-lg flex items-center justify-center shadow-blue z-10">
                      {i+1}
                    </div>
                    <div className="flex-1">
                      <CourseCard course={item.course} index={i}/>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className="bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-3xl p-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-brand-orange/15 rounded-full blur-3xl"/>
            </div>
            <div className="relative z-10">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="font-heading font-bold text-2xl mb-2">Get All {courses.length} Courses</h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-white/50 line-through text-xl">Rs {totalPrice*3}</span>
                <span className="font-heading font-bold text-4xl text-brand-orange">Rs {totalPrice}</span>
              </div>
              <p className="text-white/70 text-sm mb-6">Each at Rs 399 · Certificate for every course</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/courses" className="bg-brand-orange text-white font-bold px-8 py-4 rounded-full shadow-orange hover:bg-brand-orange-light transition-all flex items-center justify-center gap-2">
                  Start First Course <ChevronRight size={16}/>
                </Link>
                <Link href="/demo" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all">
                  Book Free Demo
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
