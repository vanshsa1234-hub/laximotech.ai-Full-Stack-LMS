// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\web\src\app\(dashboard)\learn\[slug]\[lessonId]\quiz\page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Clock, Award, ArrowRight,
  ArrowLeft, AlertCircle, Zap, RotateCcw, Home, Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { quizzesApi, lessonsApi } from '@/lib/api';
import toast from 'react-hot-toast';

type QuizState = 'loading' | 'no-quiz' | 'intro' | 'taking' | 'submitting' | 'results';

export default function QuizPage({ params }: { params: { slug: string; lessonId: string } }) {
  const { data: session } = useSession();
  const [state,    setState]    = useState<QuizState>('loading');
  const [quiz,     setQuiz]     = useState<any>(null);
  const [answers,  setAnswers]  = useState<Record<number, number>>({});
  const [current,  setCurrent]  = useState(0);
  const [results,  setResults]  = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTime = useRef<number>(0);

  // Fetch the real quiz tied to this lesson
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const lessonRes = await lessonsApi.get(params.lessonId);
        const quizId = lessonRes.data?.quiz?.id;
        if (!quizId) { setState('no-quiz'); return; }

        const quizRes = await quizzesApi.get(quizId);
        setQuiz(quizRes.data);
        setTimeLeft(quizRes.data.questions.length * 60);
        setState('intro');
      } catch (err: any) {
        if (err?.response?.status === 403) {
          toast.error('Please enroll in this course to take the quiz.');
        }
        setState('no-quiz');
      }
    })();
  }, [params.lessonId, session]);

  useEffect(() => {
    if (state !== 'taking') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [state]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const progress = quiz ? (Object.keys(answers).length / quiz.questions.length) * 100 : 0;
  const timeColor = timeLeft < 60 ? 'text-red-400' : timeLeft < 120 ? 'text-yellow-400' : 'text-white';

  const selectAnswer = (qIndex: number, optIndex: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    if (qIndex < quiz.questions.length - 1) {
      setTimeout(() => setCurrent(qIndex + 1), 400);
    }
  };

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setState('submitting');
    const answersArr = quiz.questions.map((_: any, i: number) => answers[i] ?? -1);
    const timeTakenSec = Math.floor((Date.now() - startTime.current) / 1000);

    try {
      const res = await quizzesApi.submit(quiz.id, { answers: answersArr, timeTakenSec });
      setResults(res.data);
      setState('results');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to submit quiz');
      setState('taking');
    }
  };

  const startQuiz = () => {
    startTime.current = Date.now();
    setState('taking');
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-brand-orange animate-spin" />
      </div>
    );
  }

  if (state === 'no-quiz') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="font-heading font-bold text-xl mb-2">No Quiz Available</h2>
          <p className="text-gray-400 mb-6">This lesson doesn't have a quiz yet, or you need to enroll in this course first.</p>
          <Link href={`/learn/${params.slug}/${params.lessonId}`} className="text-brand-orange hover:underline">← Back to lesson</Link>
        </div>
      </div>
    );
  }

  const q = quiz?.questions[current];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <Link href={`/learn/${params.slug}/${params.lessonId}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Lesson
        </Link>
        <div className="font-heading font-semibold text-sm">{quiz?.title}</div>
        {state === 'taking' && (
          <div className={`flex items-center gap-2 font-mono font-bold ${timeColor}`}>
            <Clock size={16} /> {formatTime(timeLeft)}
          </div>
        )}
        {state !== 'taking' && <div className="w-24" />}
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {state === 'intro' && quiz && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-brand-orange/20 flex items-center justify-center mx-auto mb-6">
              <Award size={40} className="text-brand-orange" />
            </div>
            <h1 className="font-heading font-bold text-3xl mb-3">{quiz.title}</h1>
            {quiz.bestScore != null && (
              <p className="text-gray-400 mb-2">Your best score so far: <strong className="text-brand-green">{quiz.bestScore}%</strong></p>
            )}
            <p className="text-gray-400 mb-8">Test your understanding of this section</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Questions',  value: quiz.questions.length },
                { label: 'Pass Score', value: `${quiz.passingScore}%` },
                { label: 'Time Limit', value: `${quiz.questions.length} min` },
                { label: 'XP Reward',  value: quiz.isFinalExam ? '200 XP' : '50 XP' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-4 text-center">
                  <div className="font-bold text-2xl text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>

            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={startQuiz} className="btn-primary text-lg px-10 py-4">
              Start Quiz <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {state === 'taking' && quiz && q && (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Question {current + 1} of {quiz.questions.length}</span>
                <span>{Object.keys(answers).length} answered</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progress}%` }} className="h-full bg-brand-orange rounded-full" />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {quiz.questions.map((_: any, i: number) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      i === current ? 'bg-brand-orange text-white' :
                      answers[i] !== undefined ? 'bg-green-600/30 text-green-400 border border-green-600/30' :
                      'bg-gray-800 text-gray-500 hover:bg-gray-700'
                    }`}>{i + 1}</button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-gray-700">
                  <div className="text-brand-orange text-xs font-semibold uppercase tracking-wider mb-3">Question {current + 1}</div>
                  <h2 className="font-heading font-semibold text-xl leading-relaxed">{q.question}</h2>
                </div>
                <div className="space-y-3">
                  {(q.options as string[]).map((option, i) => (
                    <motion.button key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => selectAnswer(current, i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        answers[current] === i ? 'bg-brand-orange/20 border-brand-orange text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                      }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${answers[current] === i ? 'bg-brand-orange text-white' : 'bg-gray-700 text-gray-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm leading-relaxed">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
                className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors text-sm">
                <ArrowLeft size={16} /> Previous
              </button>
              {current < quiz.questions.length - 1 ? (
                <button onClick={() => setCurrent(current + 1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit} disabled={Object.keys(answers).length < quiz.questions.length}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 text-sm">
                  Submit Quiz <ArrowRight size={14} />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {state === 'submitting' && (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="font-heading font-bold text-xl">Calculating your score...</h2>
          </div>
        )}

        {state === 'results' && results && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={`rounded-3xl p-8 text-center mb-8 ${results.passed ? 'bg-gradient-to-br from-green-900/50 to-brand-blue/30 border border-green-500/20' : 'bg-gradient-to-br from-red-900/30 to-gray-800 border border-red-500/20'}`}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
                {results.passed ? <CheckCircle size={64} className="text-green-400 mx-auto mb-4" /> : <XCircle size={64} className="text-red-400 mx-auto mb-4" />}
              </motion.div>
              <div className="font-heading font-bold text-6xl text-white mb-2">{results.score}%</div>
              <div className={`text-xl font-semibold mb-4 ${results.passed ? 'text-green-400' : 'text-red-400'}`}>
                {results.passed ? '🎉 Passed!' : '😔 Not passed this time'}
              </div>
              <p className="text-gray-300 text-sm mb-6">{results.correctCount}/{results.totalQuestions} correct · Pass score: {results.passingScore}%</p>
              {results.passed && results.xpEarned > 0 && (
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-full text-sm font-semibold">
                  <Zap size={14} /> +{results.xpEarned} XP earned!
                </div>
              )}
              {results.certificate && (
                <div className="mt-4 inline-flex items-center gap-2 bg-brand-green/20 text-brand-green border border-brand-green/30 px-4 py-2 rounded-full text-sm font-semibold">
                  <Award size={14} /> Certificate issued! Check your dashboard.
                </div>
              )}
            </div>

            <h3 className="font-heading font-bold text-lg mb-4">Answer Review</h3>
            <div className="space-y-4 mb-8">
              {results.results.map((r: any, i: number) => (
                <motion.div key={r.questionId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`rounded-2xl p-5 border ${r.isCorrect ? 'bg-green-900/20 border-green-500/20' : 'bg-red-900/20 border-red-500/20'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {r.isCorrect ? <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" /> : <XCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />}
                    <div>
                      <div className="text-sm font-semibold text-white mb-2">Q{i + 1}: {r.question}</div>
                      <div className="space-y-1">
                        {(r.options as string[]).map((opt: string, oi: number) => (
                          <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg ${
                            oi === r.correctIndex ? 'bg-green-500/20 text-green-300 font-semibold' :
                            oi === r.selectedIndex && !r.isCorrect ? 'bg-red-500/20 text-red-300' : 'text-gray-500'
                          }`}>
                            {String.fromCharCode(65 + oi)}. {opt}
                            {oi === r.correctIndex && ' ✓'}
                            {oi === r.selectedIndex && !r.isCorrect && ' ✗'}
                          </div>
                        ))}
                      </div>
                      {r.explanation && (
                        <div className="mt-2 text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2">
                          <AlertCircle size={11} className="inline mr-1 text-brand-orange" /> {r.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={`/learn/${params.slug}/${params.lessonId}`}
                className="flex items-center gap-2 bg-gray-700 text-white font-semibold px-5 py-3 rounded-full hover:bg-gray-600 transition-colors text-sm">
                <Home size={15} /> Back to Lesson
              </Link>
              {!results.passed && (
                <button onClick={() => { setState('intro'); setAnswers({}); setCurrent(0); setTimeLeft(quiz.questions.length * 60); }}
                  className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-5 py-3 rounded-full hover:bg-brand-orange-light transition-colors text-sm">
                  <RotateCcw size={15} /> Try Again
                </button>
              )}
              {results.passed && (
                <Link href="/dashboard" className="flex items-center gap-2 bg-brand-green text-white font-semibold px-5 py-3 rounded-full hover:opacity-90 transition-opacity text-sm">
                  <Award size={15} /> Go to Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
