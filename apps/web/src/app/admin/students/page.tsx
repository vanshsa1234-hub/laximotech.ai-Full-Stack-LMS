'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Award, Zap, Loader2 } from 'lucide-react';
import { useAdminStudents } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const { data: res, isLoading } = useAdminStudents(search ? { search } : undefined);
  const students = (res as any)?.data ?? [];
  const total    = (res as any)?.total ?? 0;

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl">Students</h1>
        <p className="text-gray-500 text-sm mt-1">{total} registered students</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..." className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-brand-orange" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : students.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No students found.</div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Student', 'Courses', 'Certificates', 'XP', 'Joined'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s: any, i: number) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-sm font-bold flex-shrink-0 overflow-hidden">
                        {s.image ? <img src={s.image} alt="" className="w-full h-full object-cover" /> : (s.name?.[0] ?? '?')}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{s.name ?? 'Unnamed'}</div>
                        <div className="text-gray-500 text-xs">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-white text-sm"><BookOpen size={12} className="text-brand-blue" /> {s._count?.enrollments ?? 0}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-white text-sm"><Award size={12} className="text-yellow-400" /> {s._count?.certificates ?? 0}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-white text-sm"><Zap size={12} className="text-brand-orange" /> {s.xpPoints ?? 0}</div></td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
