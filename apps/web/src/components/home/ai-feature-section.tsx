'use client';

import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, BookOpen, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  { icon: MessageSquare, title: 'Ask in Hindi or English', desc: 'AI samajhta hai dono languages. "Ye concept samajh nahi aaya" bolein aur instant explanation milega.' },
  { icon: BookOpen,      title: 'Course-Context Aware',    desc: 'Sirf current lesson ke baare mein baat karta hai — distraction nahi, focus maximum.' },
  { icon: Zap,           title: 'Instant Answers 24/7',   desc: 'Raat ko 2 baje bhi doubt ho? AI Study Buddy hamesha available hai. Koi waiting nahi.' },
];

export function AiFeatureSection() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="section-label flex items-center gap-2"><Sparkles size={14} /> AI-Powered Learning</span>
            <h2 className="section-title mt-2 mb-6">
              Meet Your Personal <span>AI Study Buddy</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Stuck on a concept? Don't wait for an instructor. Our AI Study Buddy is trained on every lesson —
              it explains, quizzes you back, and keeps you on track. Hindi ya English — dono mein.
            </p>

            <div className="space-y-5 mb-8">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                    <f.icon size={18} className="text-brand-blue" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-0.5">{f.title}</div>
                    <div className="text-gray-500 text-sm">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/courses" className="btn-primary inline-flex">
              Try It Free <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Right — Chat UI mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="bg-gray-900 rounded-3xl p-6 shadow-[0_30px_80px_rgba(0,0,0,0.2)] relative">
              {/* Window chrome */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 bg-gray-800 rounded-lg px-3 py-1 text-center">
                  <span className="text-gray-400 text-xs flex items-center justify-center gap-1">
                    <Sparkles size={10} className="text-brand-orange" /> AI Study Buddy
                  </span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="space-y-4">
                {[
                  { role: 'user', msg: 'Neural network kya hota hai? Simple mein samjhao 🙏', delay: 0.2 },
                  { role: 'ai',   msg: 'Bilkul! Neural network ek system hai jo human brain ki tarah kaam karta hai. Jaise aapke brain mein neurons hote hain, waise hi neural network mein "nodes" hote hain jo interconnected hote hain...', delay: 0.6 },
                  { role: 'user', msg: 'Ek example do real life se?', delay: 1.0 },
                  { role: 'ai',   msg: '✅ Real example: Jab aap Google Photos mein "dog" search karte ho — neural network hi photos mein dog pehchanta hai! Ye Image Recognition ka kaam hai. Chaaho toh ab CNN (Convolutional Neural Network) padh sakte ho?', delay: 1.4 },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: item.delay }}
                    className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                    {item.role === 'ai' && (
                      <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles size={12} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      item.role === 'user'
                        ? 'bg-brand-blue text-white rounded-tr-sm'
                        : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                    }`}>
                      {item.msg}
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.8 }}
                  className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-orange flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 0.2, 0.4].map((d, i) => (
                      <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }}
                        className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Input bar */}
              <div className="mt-5 flex items-center gap-2 bg-gray-800 rounded-xl px-4 py-3">
                <input className="flex-1 bg-transparent text-gray-400 text-sm outline-none placeholder:text-gray-600"
                  placeholder="Apna doubt likhein..." readOnly />
                <button className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center">
                  <ArrowRight size={14} className="text-white" />
                </button>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-blue/20 via-brand-orange/10 to-purple-600/20 blur-xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
