'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { coursesApi } from '@/lib/api';
import { useAdminInstructors } from '@/hooks/use-queries';
import { ImageUpload } from '@/components/admin/image-upload';
import toast from 'react-hot-toast';

const CATEGORIES = ['AI_ML', 'DATA_SCIENCE', 'PROGRAMMING', 'ROBOTICS_IOT', 'CYBERSECURITY_CLOUD'];
const LEVELS     = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewCoursePage() {
  const router = useRouter();
  const { data: instructors } = useAdminInstructors();
  const instructorList = (instructors as any[]) ?? [];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', shortDesc: '', description: '',
    price: 399, level: 'BEGINNER', category: 'AI_ML',
    language: 'Hindi + English', durationHrs: 30, instructorId: '', thumbnailUrl: '',
  });

  const slug = slugify(form.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.shortDesc.trim() || !form.description.trim()) {
      toast.error('Please fill in title, short description, and full description.');
      return;
    }
    if (!form.instructorId) {
      toast.error('Please select an instructor — every course needs one.');
      return;
    }
    setSaving(true);
    try {
      await coursesApi.create({
        slug,
        title:       form.title,
        shortDesc:   form.shortDesc,
        description: form.description,
        price:       Number(form.price),
        level:       form.level,
        category:    form.category,
        language:    form.language,
        durationHrs: Number(form.durationHrs),
        instructorId: form.instructorId,
        ...(form.thumbnailUrl && { thumbnailUrl: form.thumbnailUrl }),
      });
      toast.success('Course created! Open Builder to add sections, lessons, videos, and quizzes.');
      router.push('/admin/courses');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create course. Slug may already exist.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Courses
      </Link>

      <h1 className="font-heading font-bold text-white text-2xl mb-1">Create New Course</h1>
      <p className="text-gray-500 text-sm mb-8">This creates a real course row in the database.</p>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Course Title *</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Advanced React Patterns"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          {form.title && <p className="text-xs text-gray-500 mt-1">Slug: <span className="font-mono text-brand-orange">{slug}</span></p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Short Description * (for course cards)</label>
          <input value={form.shortDesc} onChange={e => setForm(p => ({ ...p, shortDesc: e.target.value }))}
            placeholder="One-line hook shown on course cards"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Description *</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4} placeholder="Full course description shown on the detail page"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange resize-none" />
        </div>

        <ImageUpload
          label="Course Thumbnail (shown on the course card)"
          value={form.thumbnailUrl}
          onChange={url => setForm(p => ({ ...p, thumbnailUrl: url }))}
          aspectClassName="aspect-video"
          helpText="Recommended: 800×450px, under 5MB."
        />

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Instructor</label>
          <select value={form.instructorId} onChange={e => setForm(p => ({ ...p, instructorId: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange">
            <option value="">Assign to myself (default)</option>
            {instructorList.map(ins => (
              <option key={ins.id} value={ins.id}>{ins.name} ({ins.role})</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Don't see the right person? <Link href="/admin/instructors" className="text-brand-orange hover:underline">Add an instructor first</Link>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Level</label>
            <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange">
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Price (Rs)</label>
            <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Duration (hours)</label>
            <input type="number" value={form.durationHrs} onChange={e => setForm(p => ({ ...p, durationHrs: Number(e.target.value) }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-5 py-3 rounded-xl text-sm disabled:opacity-60 hover:bg-brand-orange-light transition-colors">
          {saving ? <><Loader2 size={15} className="animate-spin" /> Creating...</> : <><Save size={15} /> Create Course</>}
        </button>

        <p className="text-xs text-gray-500 pt-2 border-t border-gray-800">
          Course is created as a draft by default. Use the Builder action on the courses page to add
          sections, lessons, video URLs, and quizzes.
        </p>
      </motion.form>
    </div>
  );
}
