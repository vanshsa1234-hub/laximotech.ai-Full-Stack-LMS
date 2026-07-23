'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCreateCareerPath } from '@/hooks/use-queries';
import { ImageUpload } from '@/components/admin/image-upload';
import toast from 'react-hot-toast';

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewCareerPathPage() {
  const router = useRouter();
  const createPath = useCreateCareerPath();
  const [form, setForm] = useState({
    title: '', description: '', avgSalary: '', iconUrl: '', order: 0,
  });

  const slug = slugify(form.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.avgSalary.trim()) {
      toast.error('Please fill in title, description, and average salary.');
      return;
    }
    try {
      await createPath.mutateAsync({
        slug,
        title:       form.title,
        description: form.description,
        avgSalary:   form.avgSalary,
        iconUrl:     form.iconUrl || undefined,
        order:       Number(form.order) || 0,
      });
      toast.success('Career path created! Now add courses to it.');
      router.push('/admin/career-paths');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create career path. Slug may already exist.');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <Link href="/admin/career-paths" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Career Paths
      </Link>

      <h1 className="font-heading font-bold text-white text-2xl mb-1">Create Career Path</h1>
      <p className="text-gray-500 text-sm mb-8">Add courses to the path after creating it.</p>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Title *</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Become a Data Scientist"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          {form.title && <p className="text-xs text-gray-500 mt-1">Slug: <span className="font-mono text-brand-orange">{slug}</span></p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Description *</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={4} placeholder="What this path prepares the student for"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Avg. Salary *</label>
            <input value={form.avgSalary} onChange={e => setForm(p => ({ ...p, avgSalary: e.target.value }))}
              placeholder="e.g. ₹4–25 LPA"
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

        <button type="submit" disabled={createPath.isPending}
          className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
          {createPath.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {createPath.isPending ? 'Saving...' : 'Create Career Path'}
        </button>
      </motion.form>
    </div>
  );
}
