'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, Trash2, BookOpen } from 'lucide-react';
import {
  useAdminCareerPath, useUpdateCareerPath,
  useAddCourseToPath, useRemoveCourseFromPath,
} from '@/hooks/use-queries';
import { ImageUpload } from '@/components/admin/image-upload';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditCareerPathPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: path, isLoading } = useAdminCareerPath(id);
  const updatePath = useUpdateCareerPath();
  const addCourse = useAddCourseToPath();
  const removeCourse = useRemoveCourseFromPath();

  const { data: coursesRes } = useQuery({
    queryKey: ['admin-courses-for-path'],
    queryFn:  () => coursesApi.adminList().then(r => r.data),
  });
  const allCourses: any[] = (coursesRes as any)?.data ?? [];

  const [form, setForm] = useState({ title: '', description: '', avgSalary: '', iconUrl: '', order: 0 });
  const [newCourse, setNewCourse] = useState({ courseId: '', step: 1, label: '' });

  useEffect(() => {
    if (path) {
      setForm({
        title:       (path as any).title ?? '',
        description: (path as any).description ?? '',
        avgSalary:   (path as any).avgSalary ?? '',
        iconUrl:     (path as any).iconUrl ?? '',
        order:       (path as any).order ?? 0,
      });
    }
  }, [path]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePath.mutateAsync({ id, data: { ...form, order: Number(form.order) } });
      toast.success('Career path updated!');
    } catch {
      toast.error('Failed to update career path.');
    }
  };

  const handleAddCourse = async () => {
    if (!newCourse.courseId || !newCourse.label.trim()) {
      toast.error('Pick a course and enter a step label.');
      return;
    }
    try {
      await addCourse.mutateAsync({ pathId: id, data: newCourse });
      toast.success('Course added to path!');
      setNewCourse({ courseId: '', step: (newCourse.step || 1) + 1, label: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to add course (may already be in this path).');
    }
  };

  const handleRemoveCourse = (entryId: string) => {
    if (!confirm('Remove this course from the path?')) return;
    removeCourse.mutate(entryId, { onSuccess: () => toast.success('Course removed from path') });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>;
  }

  const pathCourses = (path as any)?.courses ?? [];

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <Link href="/admin/career-paths" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Career Paths
      </Link>

      <h1 className="font-heading font-bold text-white text-2xl mb-1">Edit Career Path</h1>
      <p className="text-gray-500 text-sm mb-8">Slug: <span className="font-mono text-brand-orange">{(path as any)?.slug}</span></p>

      <div className="grid lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Basic details */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5 h-fit">
          <h2 className="text-white font-semibold text-sm mb-1">Path Details</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Avg. Salary *</label>
              <input value={form.avgSalary} onChange={e => setForm(p => ({ ...p, avgSalary: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Display Order</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
          </div>

          <ImageUpload
            label="Path Icon"
            value={form.iconUrl}
            onChange={url => setForm(p => ({ ...p, iconUrl: url }))}
            aspectClassName="aspect-square max-w-[140px]"
            helpText="Shown next to this career path on the /paths page."
          />

          <button type="submit" disabled={updatePath.isPending}
            className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
            {updatePath.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {updatePath.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.form>

        {/* Course management */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5 h-fit">
          <h2 className="text-white font-semibold text-sm mb-1">Courses in this Path</h2>

          <div className="space-y-2">
            {pathCourses.length === 0 && (
              <p className="text-gray-500 text-sm">No courses added yet.</p>
            )}
            {pathCourses.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between gap-3 bg-gray-800 rounded-xl px-3 py-2.5">
                <div className="min-w-0 flex items-center gap-2">
                  <BookOpen size={14} className="text-brand-orange flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-white text-sm truncate">{entry.course?.title}</div>
                    <div className="text-gray-500 text-xs">Step {entry.step} — {entry.label}</div>
                  </div>
                </div>
                <button onClick={() => handleRemoveCourse(entry.id)} disabled={removeCourse.isPending}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-400">Add a course to this path</p>
            <select value={newCourse.courseId} onChange={e => setNewCourse(p => ({ ...p, courseId: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange">
              <option value="">Select a course...</option>
              {allCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min={1} value={newCourse.step}
                onChange={e => setNewCourse(p => ({ ...p, step: Number(e.target.value) }))}
                placeholder="Step #"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
              <input value={newCourse.label} onChange={e => setNewCourse(p => ({ ...p, label: e.target.value }))}
                placeholder="STEP 1 — FOUNDATION"
                className="col-span-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <button onClick={handleAddCourse} disabled={addCourse.isPending}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white font-semibold py-2.5 rounded-xl text-sm hover:border-brand-orange transition-colors disabled:opacity-60">
              {addCourse.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
