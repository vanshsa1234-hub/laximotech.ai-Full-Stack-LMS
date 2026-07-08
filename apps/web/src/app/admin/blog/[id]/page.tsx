'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Globe, Lock } from 'lucide-react';
import { useAdminBlogPost, useUpdateBlogPost, useTogglePublishBlogPost } from '@/hooks/use-queries';
import { ImageUpload } from '@/components/admin/image-upload';
import toast from 'react-hot-toast';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: post, isLoading } = useAdminBlogPost(id);
  const updatePost = useUpdateBlogPost();
  const togglePublish = useTogglePublishBlogPost();

  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', coverImage: '',
    metaTitle: '', metaDesc: '', tagsInput: '',
  });

  useEffect(() => {
    if (post) {
      setForm({
        title:      (post as any).title ?? '',
        excerpt:    (post as any).excerpt ?? '',
        content:    (post as any).content ?? '',
        coverImage: (post as any).coverImage ?? '',
        metaTitle:  (post as any).metaTitle ?? '',
        metaDesc:   (post as any).metaDesc ?? '',
        tagsInput:  ((post as any).tags ?? []).map((t: any) => t.name).join(', '),
      });
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = form.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    try {
      await updatePost.mutateAsync({
        id,
        data: {
          title:      form.title,
          excerpt:    form.excerpt,
          content:    form.content,
          coverImage: form.coverImage || undefined,
          metaTitle:  form.metaTitle || undefined,
          metaDesc:   form.metaDesc || undefined,
          tags,
        },
      });
      toast.success('Post updated!');
      router.push('/admin/blog');
    } catch (err: any) {
      toast.error('Failed to update post.');
    }
  };

  const handleTogglePublish = () => {
    const isPublished = (post as any)?.isPublished;
    togglePublish.mutate({ id, publish: !isPublished }, {
      onSuccess: () => toast.success(isPublished ? 'Post unpublished' : 'Post published!'),
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <Link href="/admin/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Blog Posts
      </Link>

      <div className="flex items-center justify-between mb-1">
        <h1 className="font-heading font-bold text-white text-2xl">Edit Blog Post</h1>
        <button onClick={handleTogglePublish} disabled={togglePublish.isPending}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
            (post as any)?.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'
          }`}>
          {(post as any)?.isPublished ? <Globe size={11} /> : <Lock size={11} />}
          {(post as any)?.isPublished ? 'Published' : 'Draft'}
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">Slug: <span className="font-mono text-brand-orange">{(post as any)?.slug}</span></p>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit} className="max-w-2xl bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5">

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Title *</label>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Excerpt *</label>
          <input value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5">Content * (HTML supported)</label>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            rows={10}
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

        <button type="submit" disabled={updatePost.isPending}
          className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
          {updatePost.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {updatePost.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </motion.form>
    </div>
  );
}
