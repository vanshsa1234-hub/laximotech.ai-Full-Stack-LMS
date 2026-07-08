// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\web\src\app\(dashboard)\learn\[slug]\[lessonId]\page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  BookmarkPlus, ChevronLeft, CheckCircle, Circle,
  List, X, Clock, ChevronDown, Loader2, Lock, MessageSquare,
  FileQuestion
} from 'lucide-react';
import { AiStudyBuddy } from '@/components/ai/study-buddy';
import { DiscussionSection } from '@/components/community/discussion-section';
import { progressApi, lessonsApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function LearnPage({ params }: { params: { slug: string; lessonId: string } }) {
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const progressTimer = useRef<ReturnType<typeof setInterval>>();

  const [lesson,       setLesson]       = useState<any>(null);
  const [curriculum,   setCurriculum]   = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [playing,      setPlaying]      = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [currentTime,  setCurrentTime]  = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [speed,        setSpeed]        = useState(1);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [speedMenu,    setSpeedMenu]    = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Fetch real lesson data + course curriculum
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    setLoading(true);
    setAccessDenied(false);

    Promise.all([
      lessonsApi.get(params.lessonId),
      lessonsApi.forCourse(params.slug),
    ]).then(([lessonRes, curriculumRes]) => {
      setLesson(lessonRes.data);
      setCurriculum(curriculumRes.data);
      setVideoError(false);
      // Resume from saved bookmark/progress
      if (lessonRes.data.progress?.watchedSeconds && videoRef.current) {
        videoRef.current.currentTime = lessonRes.data.progress.watchedSeconds;
      }
    }).catch((err) => {
      if (err?.response?.status === 403) {
        setAccessDenied(true);
      } else {
        toast.error('Failed to load lesson.');
      }
    }).finally(() => setLoading(false));
  }, [params.lessonId, params.slug, sessionStatus]);

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 3000);
  };

  // Shared by both save paths below — whichever one the backend actually
  // confirms completion on, the UI needs to react the same way.
  const markedComplete = useRef(false);
  const handleProgressResponse = (res: any) => {
    if (res.data?.isCompleted && !markedComplete.current) {
      markedComplete.current = true;
      toast.success('Lesson completed! +10 XP', { icon: '🎉' });
      // Without this, /dashboard/my-courses, /dashboard/progress, and the
      // profile card kept showing stale cached progress until a hard reload.
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['activity-heatmap'] });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      // The sidebar checkmark list is plain local state (not react-query),
      // so refetch it directly too — otherwise it only updates after
      // navigating to a different lesson.
      lessonsApi.forCourse(params.slug).then(res => setCurriculum(res.data)).catch(() => {});
    }
  };

  // Save real progress every 30s while playing — this can be the FIRST call
  // to actually cross the completion threshold server-side (e.g. if the
  // lesson has no recorded duration yet), so it must handle the response
  // too, not just the dedicated 80% check below.
  useEffect(() => {
    if (!session || !playing) return;
    progressTimer.current = setInterval(() => {
      if (videoRef.current && currentTime > 0) {
        progressApi.update(params.lessonId, Math.floor(currentTime)).then(handleProgressResponse).catch(() => {});
      }
    }, 30000);
    return () => clearInterval(progressTimer.current);
  }, [session, playing, currentTime, params.lessonId]);

  // Mark complete at 80% watched (client-side estimate) — usually redundant
  // with the autosave above by the time this fires, kept as a second path
  // in case the interval hasn't ticked yet.
  useEffect(() => {
    if (duration > 0 && currentTime / duration >= 0.8 && !markedComplete.current) {
      progressApi.update(params.lessonId, Math.floor(currentTime)).then(handleProgressResponse).catch(() => {});
    }
  }, [currentTime, duration, params.lessonId, queryClient]);

  const togglePlay = () => {
    if (!videoRef.current || !lesson?.videoUrl || videoError) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(p => !p);
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const changeSpeed = (s: number) => { if (videoRef.current) videoRef.current.playbackRate = s; setSpeed(s); setSpeedMenu(false); };

  if (sessionStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-center px-4">
        <div>
          <Lock size={40} className="text-gray-500 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">Please log in</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to access course content.</p>
          <Link href={`/auth?callbackUrl=/learn/${params.slug}/${params.lessonId}`} className="btn-primary inline-flex">Log In</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={32} className="text-brand-orange animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white text-center px-4">
        <div>
          <Lock size={40} className="text-gray-500 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl mb-2">Enrollment Required</h2>
          <p className="text-gray-400 mb-6">Please enroll in this course to access this lesson.</p>
          <Link href={`/courses/${params.slug}`} className="btn-primary inline-flex">View Course</Link>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/courses/${params.slug}`} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm truncate">{lesson.section?.course?.title}</div>
            <div className="text-gray-400 text-xs truncate">{lesson.section?.title} · {lesson.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setShowDiscussion(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${showDiscussion ? 'bg-brand-blue text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            💬 Discussion
          </button>
          {lesson.quiz && (
            <Link href={`/learn/${params.slug}/${params.lessonId}/quiz`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all">
              <FileQuestion size={14} /> Quiz
            </Link>
          )}
          <button onClick={() => setSidebarOpen(p => !p)}
            className={`p-2 rounded-lg transition-all ${sidebarOpen ? 'bg-brand-blue text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Video — plays the REAL lesson.videoUrl from the API */}
          <div className="relative flex-1 bg-black group" onMouseMove={showControlsTemporarily} onClick={togglePlay}>
            {lesson.videoUrl && !videoError ? (
              <video ref={videoRef}
                src={lesson.videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onError={() => {
                  setPlaying(false);
                  setVideoError(true);
                }}>
                {lesson.subtitleEnUrl && <track kind="subtitles" src={lesson.subtitleEnUrl} srcLang="en" label="English" />}
                {lesson.subtitleHiUrl && <track kind="subtitles" src={lesson.subtitleHiUrl} srcLang="hi" label="Hindi" />}
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                {videoError
                  ? 'The uploaded video could not be loaded. Please check the video file or storage URL.'
                  : 'No video uploaded for this lesson yet.'}
              </div>
            )}

            <AnimatePresence>
              {!playing && lesson.videoUrl && !videoError && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play size={36} className="text-white fill-white ml-2" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {lesson.videoUrl && !videoError && (
              <AnimatePresence>
                {showControls && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
                    onClick={e => e.stopPropagation()}>
                    <input type="range" min={0} max={duration || 100} value={currentTime}
                      onChange={e => { const t = parseFloat(e.target.value); if (videoRef.current) videoRef.current.currentTime = t; setCurrentTime(t); }}
                      className="w-full h-1 mb-3 accent-brand-orange cursor-pointer"
                      style={{ background: `linear-gradient(to right, #FF6B00 ${(currentTime/Math.max(duration,1))*100}%, #4B5563 0%)` }} />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="text-white hover:text-brand-orange transition-colors">
                          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                        </button>
                        <button onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                          className="text-white hover:text-brand-orange transition-colors">
                          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <span className="text-gray-300 text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <button onClick={() => setSpeedMenu(p => !p)}
                            className="flex items-center gap-1 text-gray-300 text-xs font-semibold px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
                            {speed}x <ChevronDown size={10} />
                          </button>
                          {speedMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-xl overflow-hidden shadow-lg z-10">
                              {[0.5,0.75,1,1.25,1.5,1.75,2].map(s => (
                                <button key={s} onClick={() => changeSpeed(s)}
                                  className={`block w-full px-4 py-2 text-xs text-left hover:bg-gray-700 transition-colors ${speed===s?'text-brand-orange font-bold':'text-gray-300'}`}>
                                  {s}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="text-gray-300 hover:text-white transition-colors"><BookmarkPlus size={18} /></button>
                        {lesson.contentType === 'CODE' && (
                          <Link href={`/learn/${params.slug}/${params.lessonId}/playground`}
                            className="text-gray-300 hover:text-brand-orange text-xs font-semibold px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
                            Code 💻
                          </Link>
                        )}
                        {lesson.quiz && (
                          <Link href={`/learn/${params.slug}/${params.lessonId}/quiz`}
                            className="text-gray-300 hover:text-brand-orange text-xs font-semibold px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
                            Quiz 📝
                          </Link>
                        )}
                        <button onClick={() => { document.fullscreenElement ? document.exitFullscreen() : videoRef.current?.parentElement?.requestFullscreen(); setFullscreen(f => !f); }}
                          className="text-gray-300 hover:text-white transition-colors">
                          {fullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          <div className="bg-gray-900 px-4 py-3 flex items-center justify-between gap-3 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-gray-500 text-sm truncate">Use the sidebar to navigate lessons</span>
              {lesson.estimatedMinutes && (
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} /> {lesson.estimatedMinutes} min
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowDiscussion(p => !p)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                  showDiscussion ? 'bg-brand-blue text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}>
                <MessageSquare size={14} /> Discussion
              </button>
              {lesson.quiz ? (
                <Link href={`/learn/${params.slug}/${params.lessonId}/quiz`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-orange px-3 py-2 text-xs font-semibold text-white hover:bg-brand-orange-light transition-colors">
                  <FileQuestion size={14} /> Start Quiz
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-500">
                  <FileQuestion size={14} /> No quiz
                </span>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showDiscussion && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden flex-shrink-0 max-h-80 overflow-y-auto bg-gray-950 border-t border-gray-800">
                <div className="p-4">
                  <DiscussionSection lessonId={params.lessonId} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar — REAL curriculum from API */}
        <AnimatePresence>
          {sidebarOpen && curriculum && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-900 border-l border-gray-800 overflow-y-auto flex-shrink-0 no-scrollbar">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Course Content</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-white"><X size={16} /></button>
              </div>
              {curriculum.sections?.map((section: any) => (
                <div key={section.id}>
                  <div className="px-4 py-3 bg-gray-800/50">
                    <div className="text-gray-300 text-xs font-semibold uppercase tracking-wider">{section.title}</div>
                  </div>
                  {section.lessons?.map((l: any) => (
                    l.isLocked ? (
                      <div key={l.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-800 opacity-50 cursor-not-allowed">
                        <Lock size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-500 truncate">{l.title}</div>
                          <div className="text-gray-700 text-xs mt-0.5">{l.estimatedMinutes} min</div>
                        </div>
                      </div>
                    ) : (
                      <Link key={l.id} href={`/learn/${params.slug}/${l.id}`}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 transition-colors ${
                          l.id === params.lessonId ? 'bg-brand-blue/20 border-l-2 border-l-brand-orange' : 'hover:bg-gray-800'
                        }`}>
                        <div className="mt-0.5 flex-shrink-0">
                          {l.progress?.isCompleted
                            ? <CheckCircle size={16} className="text-brand-green" />
                            : <Circle size={16} className="text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm leading-snug ${l.id === params.lessonId ? 'text-white font-semibold' : 'text-gray-400'}`}>{l.title}</div>
                          <div className="text-gray-600 text-xs mt-0.5">{l.estimatedMinutes} min</div>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AiStudyBuddy courseId={lesson.section?.course?.id ?? ''} lessonId={params.lessonId} courseName={lesson.section?.course?.title} />
    </div>
  );
}
