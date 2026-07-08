'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCreateBlogPost } from '@/hooks/use-queries';
import { ImageUpload } from '@/components/admin/image-upload';
import toast from 'react-hot-toast';

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const createPost = useCreateBlogPost();
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', coverImage: '',
    metaTitle: '', metaDesc: '', tagsInput: '',
  });

  const slug = slugify(form.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error('Please fill in title, excerpt, and content.');
      return;
    }
    const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await createPost.mutateAsync({
        slug,
        title:      form.title,
        excerpt:    form.excerpt,
        content:    form.content,
        coverImage: form.coverImage || undefined,
        metaTitle:  form.metaTitle || undefined,
        metaDesc:   form.metaDesc || undefined,
        tags,
      });
      toast.success('Post created as a draft! Publish it when ready.');
      router.push('/admin/blog');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create post. Slug may already exist.');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <Link href="/admin/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Blog Posts
      </Link>

      <h1 className="font-heading font-bold text-white text-2xl mb-1">New Blog Post</h1>
      <p className="text-gray-500 text-sm mb-8">Created as a draft — publish it separately once ready.</p>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Title *</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. AI Jobs in India 2026"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          {form.title && <p className="text-xs text-gray-500 mt-1">Slug: <span className="font-mono text-brand-orange">{slug}</span></p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Excerpt * (shown on blog cards)</label>
          <input value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
            placeholder="One or two line teaser"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Content * (HTML supported)</label>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            rows={10} placeholder="<p>Write the full article here...</p>"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange resize-none font-mono" />
        </div>

        <ImageUpload
          label="Cover Image"
          value={form.coverImage}
          onChange={url => setForm(p => ({ ...p, coverImage: url }))}
          aspectClassName="aspect-video"
          helpText="Shown on the blog listing and post header."
        />

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Tags (comma separated)</label>
          <input value={form.tagsInput} onChange={e => setForm(p => ({ ...p, tagsInput: e.target.value }))}
            placeholder="AI, Careers, Data Science"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meta Title (SEO)</label>
            <input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meta Description (SEO)</label>
            <input value={form.metaDesc} onChange={e => setForm(p => ({ ...p, metaDesc: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
          </div>
        </div>

        <button type="submit" disabled={createPost.isPending}
          className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
          {createPost.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {createPost.isPending ? 'Saving...' : 'Save as Draft'}
        </button>
      </motion.form>
    </div>
  );
}
