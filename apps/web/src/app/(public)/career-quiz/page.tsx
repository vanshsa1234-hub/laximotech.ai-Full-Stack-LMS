'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ArrowRight, ArrowLeft, Brain, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'interest',
    question: 'Aapki sabse zyada interest kisme hai?',
    emoji: '❤️',
    options: [
      { label: 'Computers & Technology',  value: 'tech'    },
      { label: 'Data & Numbers',          value: 'data'    },
      { label: 'Building & Making Things',value: 'build'   },
      { label: 'Security & Protecting',   value: 'security'},
    ],
  },
  {
    id: 'goal',
    question: 'Aapka main career goal kya hai?',
    emoji: '🎯',
    options: [
      { label: 'High-paying tech job',        value: 'job'       },
      { label: 'Start my own startup',        value: 'startup'   },
      { label: 'Freelancing from home',       value: 'freelance' },
      { label: 'Government / PSU sector',     value: 'govt'      },
    ],
  },
  {
    id: 'background',
    question: 'Aapka current background kya hai?',
    emoji: '🎓',
    options: [
      { label: 'Complete beginner',        value: 'beginner'     },
      { label: 'Some programming basics',  value: 'some'         },
      { label: 'Engineering student',      value: 'engineering'  },
      { label: 'Working professional',     value: 'professional' },
    ],
  },
  {
    id: 'time',
    question: 'Kitna time de sakte ho per day?',
    emoji: '⏰',
    options: [
      { label: '30 min – 1 hour',  value: '1h'  },
      { label: '1–2 hours',        value: '2h'  },
      { label: '2–4 hours',        value: '4h'  },
      { label: '4+ hours (full)',   value: '4h+' },
    ],
  },
  {
    id: 'salary',
    question: 'Aapka expected salary range (per year)?',
    emoji: '💰',
    options: [
      { label: 'Rs 3–6 LPA (entry level)',  value: 'entry'  },
      { label: 'Rs 6–12 LPA',              value: 'mid'    },
      { label: 'Rs 12–25 LPA',             value: 'senior' },
      { label: 'Rs 25 LPA+ (ambitious!)',  value: 'top'    },
    ],
  },
];

interface Recommendation {
  path:        string;
  slug:        string;
  emoji:       string;
  salary:      string;
  duration:    string;
  match:       number;
  why:         string;
  firstCourse: { title: string; slug: string };
}

function getRecommendation(answers: Record<string, string>): Recommendation[] {
  const recs: Recommendation[] = [];

  const interest  = answers.interest;
  const goal      = answers.goal;
  const salary    = answers.salary;

  if (interest === 'tech' || interest === 'data') {
    recs.push({
      path: 'AI Engineer',  slug: 'become-ai-engineer', emoji: '🤖',
      salary: 'Rs 8–35 LPA', duration: '6 months',
      match: interest === 'tech' ? 95 : 88,
      why: 'AI/ML is India ka fastest growing career. Aapki tech interest + ' + (salary === 'top' || salary === 'senior' ? 'high salary goal' : 'goals') + ' perfect match hai.',
      firstCourse: { title: 'Python Programming', slug: 'python-programming-hindi' },
    });
  }

  if (interest === 'data' || goal === 'job') {
    recs.push({
      path: 'Data Analyst', slug: 'become-data-analyst', emoji: '📊',
      salary: 'Rs 4–18 LPA', duration: '4 months',
      match: interest === 'data' ? 92 : 80,
      why: 'Data Analytics mein entry level pe bhi achhi jobs milti hain. Sirf 4 mahine mein job-ready ho sakte hain.',
      firstCourse: { title: 'Data Science for Beginners', slug: 'data-science-beginners-hindi' },
    });
  }

  if (interest === 'security') {
    recs.push({
      path: 'Cybersecurity Expert', slug: 'become-cybersecurity-expert', emoji: '🔒',
      salary: 'Rs 5–25 LPA', duration: '5 months',
      match: 96,
      why: 'Cybersecurity mein demand bahut hai aur supply kam. Aapki security interest ke saath yeh perfect fit hai.',
      firstCourse: { title: 'Cybersecurity & Ethical Hacking', slug: 'cybersecurity-ethical-hacking-hindi' },
    });
  }

  if (interest === 'build') {
    recs.push({
      path: 'Full Stack Developer', slug: 'become-full-stack-developer', emoji: '💻',
      salary: 'Rs 5–20 LPA', duration: '6 months',
      match: 91,
      why: 'Building cheezein banana pasand hai? Full Stack development mein aap websites aur apps banate hain jo lakhs log use karte hain.',
      firstCourse: { title: 'Python Programming', slug: 'python-programming-hindi' },
    });
    if (answers.goal === 'startup' || answers.goal === 'freelance') {
      recs[recs.length - 1].match = 97;
    }
  }

  if (recs.length === 0) {
    recs.push({
      path: 'AI Engineer', slug: 'become-ai-engineer', emoji: '🤖',
      salary: 'Rs 8–35 LPA', duration: '6 months', match: 85,
      why: 'AI Engineering India ka most in-demand career hai. Yeh ek safe bet hai kisi bhi background se.',
      firstCourse: { title: 'Python Programming', slug: 'python-programming-hindi' },
    });
  }

  return recs.sort((a, b) => b.match - a.match).slice(0, 3);
}

export default function CareerQuizPage() {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Recommendation[] | null>(null);

  const q = QUESTIONS[step];
  const progress = ((step) / QUESTIONS.length) * 100;

  const answer = (value: string) => {
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      setTimeout(() => setResults(getRecommendation(newAnswers)), 400);
    }
  };

  const reset = () => { setStep(0); setAnswers({}); setResults(null); };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        <div className="bg-mesh pt-28 pb-14 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 glass text-white/90 text-sm px-4 py-2 rounded-full border border-white/20 mb-5">
              <Sparkles size={14} className="text-brand-orange" /> AI-Powered Career Recommender
            </div>
            <h1 className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">
              Kaunsa Career <span className="text-brand-orange">Best Hai Aapke Liye?</span>
            </h1>
            <p className="text-white/70 text-lg">5 sawalon mein pata karo — AI aapke liye best path suggest karega</p>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-4">
          <AnimatePresence mode="wait">

            {/* Quiz */}
            {!results && (
              <motion.div key={`q-${step}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-8">

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Question {step + 1} of {QUESTIONS.length}</span>
                    <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}% complete</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-brand-orange rounded-full" />
                  </div>
                  {/* Step dots */}
                  <div className="flex gap-2 mt-3 justify-center">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                        i <= step ? 'bg-brand-orange w-6' : 'bg-gray-200 w-1.5'
                      }`} />
                    ))}
                  </div>
                </div>

                {/* Question */}
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">{q.emoji}</div>
                  <h2 className="font-heading font-bold text-gray-900 text-2xl leading-snug">{q.question}</h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map((opt, i) => (
                    <motion.button key={opt.value}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => answer(opt.value)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        answers[q.id] === opt.value
                          ? 'border-brand-orange bg-brand-orange/5'
                          : 'border-gray-100 hover:border-brand-orange/40 hover:bg-orange-50/50'
                      }`}>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        answers[q.id] === opt.value ? 'border-brand-orange bg-brand-orange' : 'border-gray-300'
                      }`}>
                        {answers[q.id] === opt.value && <CheckCircle size={16} className="text-white fill-white" />}
                      </div>
                      <span className="font-medium text-gray-800">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Back button */}
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} className="mt-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm transition-colors">
                    <ArrowLeft size={14} /> Previous question
                  </button>
                )}
              </motion.div>
            )}

            {/* Results */}
            {results && (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-center mb-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-2xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
                    <Brain size={40} className="text-brand-orange" />
                  </motion.div>
                  <h2 className="font-heading font-bold text-gray-900 text-2xl mb-2">Aapke liye Best Career Paths</h2>
                  <p className="text-gray-500">AI ne aapke answers analyse kiye — yeh hain top recommendations:</p>
                </div>

                <div className="space-y-4 mb-8">
                  {results.map((rec, i) => (
                    <motion.div key={rec.slug}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className={`bg-white rounded-2xl p-6 shadow-card border-2 ${i === 0 ? 'border-brand-orange' : 'border-gray-100'}`}>
                      {i === 0 && (
                        <div className="flex items-center gap-1.5 text-brand-orange text-xs font-bold uppercase tracking-wider mb-3">
                          <Sparkles size={12} /> Top Recommendation
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{rec.emoji}</span>
                          <div>
                            <h3 className="font-heading font-bold text-gray-900 text-lg">{rec.path}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><TrendingUp size={12} className="text-brand-green" /> {rec.salary}</span>
                              <span>· {rec.duration}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="font-heading font-bold text-2xl text-brand-orange">{rec.match}%</div>
                          <div className="text-gray-400 text-xs">match</div>
                        </div>
                      </div>

                      {/* Match bar */}
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${rec.match}%` }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                          className="h-full bg-brand-orange rounded-full" />
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{rec.why}</p>

                      <div className="flex items-center gap-3">
                        <Link href={`/paths/${rec.slug}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-brand-blue-light transition-colors">
                          View Full Path <ArrowRight size={14} />
                        </Link>
                        <Link href={`/courses/${rec.firstCourse.slug}`}
                          className="flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-brand-orange-light transition-colors">
                          Start Now — Rs 399
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center">
                  <button onClick={reset} className="text-gray-400 hover:text-gray-600 text-sm transition-colors underline">
                    Take quiz again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
