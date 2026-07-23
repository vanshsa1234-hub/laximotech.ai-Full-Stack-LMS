'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Route, Edit, Trash2, Loader2, IndianRupee, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminCareerPaths, useDeleteCareerPath } from '@/hooks/use-queries';

export default function AdminCareerPathsPage() {
  const { data: paths, isLoading } = useAdminCareerPaths();
  const deletePath = useDeleteCareerPath();

  const list = (paths as any[]) ?? [];

  const handleDelete = (path: any) => {
    if (!confirm(`Delete career path "${path.title}"? This also removes it from all listed courses.`)) return;
    deletePath.mutate(path.id, { onSuccess: () => toast.success('Career path deleted') });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Career Paths</h1>
          <p className="text-gray-500 text-sm mt-1">{list.length} career {list.length === 1 ? 'path' : 'paths'}</p>
        </div>
        <Link href="/admin/career-paths/new"
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-brand-orange-light transition-colors">
          <Plus size={16} /> New Career Path
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No career paths yet. Create your first one.</div>
      ) : (
        <div className="grid gap-4">
          {list.map((path: any, i: number) => (
            <motion.div key={path.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                  <Route size={18} className="text-brand-orange" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-semibold text-sm truncate">{path.title}</div>
                  <div className="flex items-center gap-3 text-gray-500 text-xs mt-1">
                    <span className="flex items-center gap-1"><IndianRupee size={11} /> {path.avgSalary}</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {path.courses?.length ?? 0} courses</span>
                    <span className="font-mono text-gray-600">/{path.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => window.open(`/paths`, '_blank')}
                  className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all text-xs">
                  View
                </button>
                <Link href={`/admin/career-paths/${path.id}`}
                  className="p-2 text-gray-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all">
                  <Edit size={14} />
                </Link>
                <button onClick={() => handleDelete(path)} disabled={deletePath.isPending}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
