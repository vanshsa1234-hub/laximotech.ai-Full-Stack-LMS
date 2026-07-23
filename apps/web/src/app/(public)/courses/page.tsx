'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { CourseCard } from '@/components/courses/course-card';
import { CourseGridSkeleton } from '@/components/common/skeletons';
import { useCourses } from '@/hooks/use-queries';
import { CATEGORY_LABELS } from '@/lib/utils';

const CATEGORIES = [
  { value: 'all',                 label: 'All Courses' },
  { value: 'AI_ML',              label: 'AI & ML' },
  { value: 'DATA_SCIENCE',       label: 'Data Science' },
  { value: 'PROGRAMMING',        label: 'Programming' },
  { value: 'ROBOTICS_IOT',       label: 'Robotics & IoT' },
  { value: 'CYBERSECURITY_CLOUD',label: 'Cybersecurity' },
];
const LEVELS  = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const SORT_BY = ['Popular', 'Newest', 'Rating', 'Duration'];

export default function CoursesPage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [level,    setLevel]    = useState('All');
  const [sort,     setSort]     = useState('Popular');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = useMemo(() => {
    const p: Record<string,string> = {};
    if (search && search.length > 1) p.q        = search;
    if (category !== 'all')          p.category  = category;
    if (level !== 'All')             p.level     = level;
    if (sort === 'Newest')           p.sort      = 'newest';
    if (sort === 'Duration')         p.sort      = 'duration';
    return p;
  }, [search, category, level, sort]);

  const { data: res, isLoading } = useCourses(params);
  const courses = (res as any)?.data ?? res ?? [];
  const total   = (res as any)?.total ?? courses.length;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-brand-ice">
        {/* Header */}
        <div className="bg-mesh pt-28 pb-14 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-heading font-bold text-white text-4xl md:text-5xl mb-3">
            All Courses — <span className="text-brand-orange">Rs 399</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/70 text-lg">
            {total} courses · Certificate included · Lifetime access
          </motion.p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search courses..." className="input pl-11 h-12" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input h-12 w-full sm:w-40 cursor-pointer">
              {SORT_BY.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setFiltersOpen(p => !p)}
              className={`flex items-center justify-center gap-2 h-12 px-5 rounded-xl border font-medium text-sm transition-all ${
                filtersOpen ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-brand-orange'
              }`}>
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {/* Filters panel */}
          {filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Category</div>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setCategory(c.value)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        category === c.value ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>{c.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Level</div>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setLevel(l)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        level === l ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>{l === 'All' ? 'All Levels' : l.charAt(0) + l.slice(1).toLowerCase()}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Category quick tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  category === c.value ? 'bg-brand-blue text-white shadow-blue' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-orange hover:text-brand-orange'
                }`}>{c.label}</button>
            ))}
          </div>

          {/* Count + clear */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `${total} course${total !== 1 ? 's' : ''} found`}
              {search && <span className="text-brand-orange"> for "{search}"</span>}
            </p>
            {(search || category !== 'all' || level !== 'All') && (
              <button onClick={() => { setSearch(''); setCategory('all'); setLevel('All'); }}
                className="text-xs text-brand-orange hover:underline flex items-center gap-1">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          {isLoading ? <CourseGridSkeleton count={6} /> : (
            courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any, i: number) => <CourseCard key={course.id} course={course} index={i} />)}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-heading font-semibold text-gray-700 text-xl mb-2">No courses found</h3>
                <p className="text-gray-400 text-sm">Try a different search or filter</p>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
