// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\web\src\app\admin\courses\[id]\builder\page.tsx
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Check, FileQuestion, Loader2, Plus, Save, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '@/lib/api';

const CONTENT_TYPES = ['VIDEO', 'PDF', 'QUIZ', 'CODE', 'TEXT'];

type QuestionForm = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  order: number;
};

const emptyLesson = (sectionId = '') => ({
  id: '',
  sectionId,
  title: '',
  order: 1,
  contentType: 'VIDEO',
  videoUrl: '',
  videoDurationSec: '',
  pdfUrl: '',
  textContent: '',
  subtitleHiUrl: '',
  subtitleEnUrl: '',
  starterCode: '',
  estimatedMinutes: 10,
  isPreview: false,
  isMandatory: true,
});

const emptyQuiz = () => ({
  title: '',
  passingScore: 70,
  isFinalExam: false,
  questions: [
    {
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
      order: 1,
    },
  ] as QuestionForm[],
});

export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const [sectionTitle, setSectionTitle] = useState('');
  const [savingSection, setSavingSection] = useState(false);
  const [lessonForm, setLessonForm] = useState<any>(emptyLesson());
  const [quizForm, setQuizForm] = useState<any>(emptyQuiz());
  const [savingLesson, setSavingLesson] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course-builder', params.id],
    queryFn: () => coursesApi.builder(params.id).then(r => r.data),
  });

  const selectedLesson = useMemo(() => {
    if (!lessonForm.id || !course) return null;
    return course.sections
      ?.flatMap((s: any) => s.lessons ?? [])
      .find((l: any) => l.id === lessonForm.id);
  }, [course, lessonForm.id]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['course-builder', params.id] });

  const selectLesson = (lesson: any, sectionId: string) => {
    setLessonForm({
      ...emptyLesson(sectionId),
      ...lesson,
      sectionId,
      videoDurationSec: lesson.videoDurationSec ?? '',
      estimatedMinutes: lesson.estimatedMinutes ?? 10,
      videoUrl: lesson.videoUrl ?? '',
      pdfUrl: lesson.pdfUrl ?? '',
      textContent: lesson.textContent ?? '',
      subtitleHiUrl: lesson.subtitleHiUrl ?? '',
      subtitleEnUrl: lesson.subtitleEnUrl ?? '',
      starterCode: lesson.starterCode ?? '',
    });
    setQuizForm(lesson.quiz
      ? {
          title: lesson.quiz.title,
          passingScore: lesson.quiz.passingScore,
          isFinalExam: lesson.quiz.isFinalExam,
          questions: lesson.quiz.questions.map((q: any, i: number) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation ?? '',
            order: q.order ?? i + 1,
          })),
        }
      : emptyQuiz());
  };

  const startNewLesson = (sectionId: string, nextOrder: number) => {
    setLessonForm({ ...emptyLesson(sectionId), order: nextOrder });
    setQuizForm(emptyQuiz());
  };

  const createSection = async () => {
    if (!sectionTitle.trim()) return;
    setSavingSection(true);
    try {
      await coursesApi.createSection(params.id, { title: sectionTitle.trim() });
      setSectionTitle('');
      toast.success('Section added');
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add section');
    } finally {
      setSavingSection(false);
    }
  };

  const saveLesson = async () => {
    if (!lessonForm.sectionId) {
      toast.error('Select a section first');
      return;
    }
    if (!lessonForm.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }
    setSavingLesson(true);
    try {
      const payload = {
        ...lessonForm,
        order: Number(lessonForm.order),
        estimatedMinutes: Number(lessonForm.estimatedMinutes || 0),
        videoDurationSec: lessonForm.videoDurationSec === '' ? undefined : Number(lessonForm.videoDurationSec),
      };
      const res = lessonForm.id
        ? await coursesApi.updateLesson(lessonForm.id, payload)
        : await coursesApi.createLesson(lessonForm.sectionId, payload);
      toast.success(lessonForm.id ? 'Lesson updated' : 'Lesson added');
      selectLesson(res.data, res.data.sectionId ?? lessonForm.sectionId);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const saveQuiz = async () => {
    if (!lessonForm.id) {
      toast.error('Save the lesson before adding a quiz');
      return;
    }
    const questions = quizForm.questions.map((q: QuestionForm, i: number) => ({ ...q, order: i + 1 }));
    if (!quizForm.title.trim() || questions.some((q: QuestionForm) => !q.question.trim() || q.options.some(o => !o.trim()))) {
      toast.error('Quiz title, questions, and all four options are required');
      return;
    }
    setSavingQuiz(true);
    try {
      await coursesApi.upsertLessonQuiz(lessonForm.id, {
        title: quizForm.title,
        passingScore: Number(quizForm.passingScore),
        isFinalExam: Boolean(quizForm.isFinalExam),
        questions,
      });
      toast.success('Quiz saved');
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to save quiz');
    } finally {
      setSavingQuiz(false);
    }
  };

  const updateQuestion = (index: number, patch: Partial<QuestionForm>) => {
    setQuizForm((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: QuestionForm, i: number) => i === index ? { ...q, ...patch } : q),
    }));
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuizForm((prev: any) => ({
      ...prev,
      questions: prev.questions.map((q: QuestionForm, i: number) => {
        if (i !== questionIndex) return q;
        const options = [...q.options];
        options[optionIndex] = value;
        return { ...q, options };
      }),
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={28} className="text-brand-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Courses
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">{course?.title}</h1>
          <p className="text-gray-500 text-sm mt-1">Sections, lessons, video URLs, and quizzes</p>
        </div>
        <Link href={`/courses/${course?.slug}`} target="_blank"
          className="text-sm font-semibold text-gray-300 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 hover:text-white hover:border-gray-700">
          View Course
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <label className="block text-xs font-semibold text-gray-400 mb-2">Add Section</label>
            <div className="flex gap-2">
              <input value={sectionTitle} onChange={e => setSectionTitle(e.target.value)}
                placeholder="e.g. Foundation"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
              <button onClick={createSection} disabled={savingSection || !sectionTitle.trim()}
                className="inline-flex items-center gap-2 bg-brand-orange text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50">
                {savingSection ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add
              </button>
            </div>
          </div>

          {course?.sections?.map((section: any) => (
            <div key={section.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-800">
                <div>
                  <div className="text-white font-semibold text-sm">{section.order}. {section.title}</div>
                  <div className="text-gray-500 text-xs">{section.lessons?.length ?? 0} lessons</div>
                </div>
                <button onClick={() => startNewLesson(section.id, (section.lessons?.length ?? 0) + 1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-orange-light">
                  <Plus size={13} /> Lesson
                </button>
              </div>

              <div className="divide-y divide-gray-800/70">
                {section.lessons?.map((lesson: any) => (
                  <button key={lesson.id} onClick={() => selectLesson(lesson, section.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      lessonForm.id === lesson.id ? 'bg-brand-blue/20' : 'hover:bg-gray-800/60'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {lesson.contentType === 'VIDEO' ? <Video size={15} className="text-brand-orange" /> : <BookOpen size={15} className="text-gray-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white truncate">{lesson.order}. {lesson.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{lesson.contentType}</span>
                          {lesson.videoUrl && <span>Video set</span>}
                          {lesson.quiz && <span className="text-brand-green">Quiz</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {(section.lessons?.length ?? 0) === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">No lessons yet.</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-semibold text-white">{lessonForm.id ? 'Edit Lesson' : 'New Lesson'}</h2>
              {lessonForm.id && <span className="text-xs text-gray-500 font-mono">{lessonForm.id}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input value={lessonForm.title} onChange={e => setLessonForm((p: any) => ({ ...p, title: e.target.value }))}
                  className="admin-input" placeholder="Lesson title" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Order">
                  <input type="number" value={lessonForm.order} onChange={e => setLessonForm((p: any) => ({ ...p, order: Number(e.target.value) }))}
                    className="admin-input" />
                </Field>
                <Field label="Minutes">
                  <input type="number" value={lessonForm.estimatedMinutes} onChange={e => setLessonForm((p: any) => ({ ...p, estimatedMinutes: Number(e.target.value) }))}
                    className="admin-input" />
                </Field>
              </div>
              <Field label="Content Type">
                <select value={lessonForm.contentType} onChange={e => setLessonForm((p: any) => ({ ...p, contentType: e.target.value }))}
                  className="admin-input">
                  {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Video Duration Seconds">
                <input type="number" value={lessonForm.videoDurationSec} onChange={e => setLessonForm((p: any) => ({ ...p, videoDurationSec: e.target.value }))}
                  className="admin-input" placeholder="Optional" />
              </Field>
            </div>

            <div className="mt-4 space-y-4">
              <Field label="Video URL or S3 key">
                <input value={lessonForm.videoUrl} onChange={e => setLessonForm((p: any) => ({ ...p, videoUrl: e.target.value }))}
                  className="admin-input" placeholder="https://...mp4 or videos/file.mp4" />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Hindi Subtitle URL or key">
                  <input value={lessonForm.subtitleHiUrl} onChange={e => setLessonForm((p: any) => ({ ...p, subtitleHiUrl: e.target.value }))}
                    className="admin-input" placeholder="Optional .vtt" />
                </Field>
                <Field label="English Subtitle URL or key">
                  <input value={lessonForm.subtitleEnUrl} onChange={e => setLessonForm((p: any) => ({ ...p, subtitleEnUrl: e.target.value }))}
                    className="admin-input" placeholder="Optional .vtt" />
                </Field>
              </div>
              <Field label="PDF URL or key">
                <input value={lessonForm.pdfUrl} onChange={e => setLessonForm((p: any) => ({ ...p, pdfUrl: e.target.value }))}
                  className="admin-input" placeholder="Optional" />
              </Field>
              <Field label="Text Content">
                <textarea value={lessonForm.textContent} onChange={e => setLessonForm((p: any) => ({ ...p, textContent: e.target.value }))}
                  rows={4} className="admin-input resize-none" placeholder="Optional lesson notes" />
              </Field>
              <Field label="Starter Code">
                <textarea value={lessonForm.starterCode} onChange={e => setLessonForm((p: any) => ({ ...p, starterCode: e.target.value }))}
                  rows={4} className="admin-input resize-none font-mono" placeholder="Optional code lesson starter" />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={lessonForm.isPreview} onChange={e => setLessonForm((p: any) => ({ ...p, isPreview: e.target.checked }))}
                  className="accent-brand-orange" />
                Free preview
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={lessonForm.isMandatory} onChange={e => setLessonForm((p: any) => ({ ...p, isMandatory: e.target.checked }))}
                  className="accent-brand-orange" />
                Mandatory
              </label>
            </div>

            <button onClick={saveLesson} disabled={savingLesson}
              className="mt-5 inline-flex items-center gap-2 bg-brand-orange text-white font-semibold px-5 py-3 rounded-xl text-sm disabled:opacity-60">
              {savingLesson ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Lesson
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <FileQuestion size={18} className="text-brand-orange" />
              <h2 className="font-heading font-semibold text-white">Quiz For Selected Lesson</h2>
            </div>

            {!lessonForm.id ? (
              <p className="text-sm text-gray-500">Save or select a lesson before adding a quiz.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Quiz Title">
                    <input value={quizForm.title} onChange={e => setQuizForm((p: any) => ({ ...p, title: e.target.value }))}
                      className="admin-input" placeholder={`${lessonForm.title} Quiz`} />
                  </Field>
                  <Field label="Passing Score">
                    <input type="number" value={quizForm.passingScore} onChange={e => setQuizForm((p: any) => ({ ...p, passingScore: Number(e.target.value) }))}
                      className="admin-input" />
                  </Field>
                  <label className="inline-flex items-end gap-2 text-sm text-gray-300 pb-2">
                    <input type="checkbox" checked={quizForm.isFinalExam} onChange={e => setQuizForm((p: any) => ({ ...p, isFinalExam: e.target.checked }))}
                      className="accent-brand-orange" />
                    Final exam
                  </label>
                </div>

                {quizForm.questions.map((q: QuestionForm, qi: number) => (
                  <div key={qi} className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
                    <Field label={`Question ${qi + 1}`}>
                      <textarea value={q.question} onChange={e => updateQuestion(qi, { question: e.target.value })}
                        rows={2} className="admin-input resize-none" />
                    </Field>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      {q.options.map((option, oi) => (
                        <div key={oi} className="flex gap-2">
                          <button onClick={() => updateQuestion(qi, { correctIndex: oi })}
                            className={`w-10 rounded-lg text-xs font-bold border ${
                              q.correctIndex === oi ? 'bg-brand-green text-white border-brand-green' : 'bg-gray-800 text-gray-400 border-gray-700'
                            }`}>
                            {String.fromCharCode(65 + oi)}
                          </button>
                          <input value={option} onChange={e => updateOption(qi, oi, e.target.value)}
                            className="admin-input" placeholder={`Option ${String.fromCharCode(65 + oi)}`} />
                        </div>
                      ))}
                    </div>
                    <Field label="Explanation" className="mt-3">
                      <textarea value={q.explanation} onChange={e => updateQuestion(qi, { explanation: e.target.value })}
                        rows={2} className="admin-input resize-none" placeholder="Shown after submission" />
                    </Field>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setQuizForm((p: any) => ({
                    ...p,
                    questions: [...p.questions, { ...emptyQuiz().questions[0], order: p.questions.length + 1 }],
                  }))}
                    className="inline-flex items-center gap-2 bg-gray-800 text-gray-200 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700">
                    <Plus size={14} /> Add Question
                  </button>
                  <button onClick={saveQuiz} disabled={savingQuiz}
                    className="inline-flex items-center gap-2 bg-brand-blue text-white font-semibold px-4 py-2.5 rounded-xl text-sm disabled:opacity-60">
                    {savingQuiz ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(55 65 81);
          background: rgb(31 41 55);
          padding: 0.625rem 0.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
        }
        .admin-input:focus {
          border-color: #ff6b00;
        }
      `}</style>
    </div>
  );
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
