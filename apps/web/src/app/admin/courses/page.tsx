// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\web\src\app\admin\courses\page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, Edit, ToggleLeft, ToggleRight, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { coursesApi } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const CATEGORY_COLORS: Record<string, string> = {
  AI_ML:'bg-purple-500/10 text-purple-400', DATA_SCIENCE:'bg-blue-500/10 text-blue-400',
  PROGRAMMING:'bg-green-500/10 text-green-400', ROBOTICS_IOT:'bg-orange-500/10 text-orange-400',
  CYBERSECURITY_CLOUD:'bg-red-500/10 text-red-400',
};
const CATEGORY_LABELS: Record<string, string> = {
  AI_ML:'AI & ML', DATA_SCIENCE:'Data Science', PROGRAMMING:'Programming',
  ROBOTICS_IOT:'Robotics', CYBERSECURITY_CLOUD:'Cybersecurity',
};

export default function AdminCoursesPage() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  // Admin needs ALL courses including drafts — pass a flag the public endpoint
  // doesn't filter by isPublished when called by an authenticated admin.
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn:  () => coursesApi.adminList(search ? { q: search } : undefined).then(r => r.data),
  });
  const courses: any[] = (res as any)?.data ?? [];

  const togglePublish = async (id: string, current: boolean) => {
    try {
      await coursesApi.update(id, { isPublished: !current });
      toast.success(current ? 'Course unpublished' : 'Course published!');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch {
      toast.error('Failed to update course status');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} courses loaded</p>
        </div>
        <Link href="/admin/courses/new"
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-orange-light transition-colors text-sm">
          <Plus size={16} /> Add Course
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..." className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-brand-orange" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No courses yet. <Link href="/admin/courses/new" className="text-brand-orange hover:underline">Create your first one →</Link>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Course', 'Category', 'Level', 'Enrollments', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map((course: any, i: number) => (
                <motion.tr key={course.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen size={14} className="text-brand-blue" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium leading-snug max-w-[220px] truncate">{course.title}</div>
                        <div className="text-gray-500 text-xs">Rs {course.price}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CATEGORY_COLORS[course.category] ?? 'bg-gray-700 text-gray-300'}`}>
                      {CATEGORY_LABELS[course.category] ?? course.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs capitalize">{course.level?.toLowerCase()}</td>
                  <td className="px-5 py-4 text-white text-sm font-semibold">{(course._count?.enrollments ?? 0).toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => togglePublish(course.id, course.isPublished)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                        course.isPublished ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}>
                      {course.isPublished ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {course.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.open(`/courses/${course.slug}`, '_blank')}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
                        <Eye size={14} />
                      </button>
                      <Link href={`/admin/courses/${course.id}/builder`}
                        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
                        <Edit size={14} />
                      </Link>
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
