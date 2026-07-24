'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, FileText, Eye, Edit, Globe, Lock, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminBlogPosts, useTogglePublishBlogPost, useDeleteBlogPost } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

export default function AdminBlogPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: res, isLoading } = useAdminBlogPosts(statusFilter ? { status: statusFilter } : undefined);
  const togglePublish = useTogglePublishBlogPost();
  const deletePost = useDeleteBlogPost();

  const posts = (res as any)?.data ?? [];
  const publishedCount = posts.filter((p: any) => p.isPublished).length;
  const draftCount = posts.filter((p: any) => !p.isPublished).length;

  const handleToggle = (post: any) => {
    togglePublish.mutate({ id: post.id, publish: !post.isPublished }, {
      onSuccess: () => toast.success(post.isPublished ? 'Post unpublished' : 'Post published!'),
    });
  };

  const handleDelete = (post: any) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    deletePost.mutate(post.id, { onSuccess: () => toast.success('Post deleted') });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">{publishedCount} published · {draftCount} drafts</p>
        </div>
        <Link href="/admin/blog/new"
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-brand-orange-light transition-colors">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ v: '', l: 'All' }, { v: 'published', l: 'Published' }, { v: 'draft', l: 'Drafts' }].map(f => (
          <button key={f.v} onClick={() => setStatusFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === f.v ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}>
            {f.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No blog posts yet. Create your first one.</div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Title', 'Status', 'Date', 'Author', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any, i: number) => (
                <motion.tr key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileText size={14} className="text-gray-500 flex-shrink-0" />
                      <span className="text-white text-sm font-medium">{post.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(post)} disabled={togglePublish.isPending}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                        post.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                      {post.isPublished ? <Globe size={11} /> : <Lock size={11} />}
                      {post.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">
                    {post.isPublished && post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{post.author?.name ?? '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {post.isPublished && (
                        <button onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
                          <Eye size={14} />
                        </button>
                      )}
                      <Link href={`/admin/blog/${post.id}`}
                        className="p-1.5 text-gray-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all">
                        <Edit size={14} />
                      </Link>
                      <button onClick={() => handleDelete(post)} disabled={deletePost.isPending}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
