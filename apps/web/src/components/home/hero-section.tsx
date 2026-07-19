// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Search, Play, Star, Users, Award, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
// import { useRouter } from 'next/navigation';
// import { usePlatformStats } from '@/hooks/use-queries';
// import DotField from './DotField';

// const floatingBadges = [
//   // { icon: '🤖', label: 'AI & ML',        delay: 0,    x: '-left-4',  y: 'top-20',    rotate: '-6deg' },
//   // { icon: '📊', label: 'Data Science',   delay: 0.5,  x: 'right-0',  y: 'top-32',    rotate: '5deg' },
//   // { icon: '🐍', label: 'Python',         delay: 1,    x: '-left-2',  y: 'bottom-32', rotate: '4deg' },
//   // { icon: '🔒', label: 'Cybersecurity',  delay: 1.5,  x: 'right-2',  y: 'bottom-20', rotate: '-3deg' },
// ];

// const suggestions = ['AI for Beginners', 'Python Hindi', 'Data Science', 'Machine Learning', 'Cybersecurity', 'Robotics Arduino'];

// export function HeroSection() {
//   const router     = useRouter();
//   const { data: stats } = usePlatformStats();
//   const [query, setQuery]       = useState('');
//   const [focused, setFocused]   = useState(false);
//   const [filtered, setFiltered] = useState<string[]>([]);

//   // ── Search suggestions ───────────────────────────────────
//   useEffect(() => {
//     if (query.length > 0) {
//       setFiltered(suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())));
//     } else {
//       setFiltered([]);
//     }
//   }, [query]);

//   const handleSearch = (q?: string) => {
//     const term = q ?? query;
//     if (term.trim()) router.push(`/courses?q=${encodeURIComponent(term)}`);
//   };

//   return (
//     <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-mesh">
//       {/* Interactive cursor-reactive dot field */}
//       <DotField
//         className="absolute inset-0 w-full h-full pointer-events-none"
//           dotRadius={1}
//           dotSpacing={45}
//           cursorRadius={500}
//           cursorForce={0.1}
//           bulgeOnly
//           bulgeStrength={67}
//           glowRadius={10}
//           waveAmplitude={0}
//           sparkle
//           darkGradientFrom="#ffffff"
//           darkGradientTo="#ffffff"
//           darkGlowColor="#120f17"
//           lightGradientFrom="#000000"
//           lightGradientTo="#000000"
//           lightGlowColor="#ffffff"
//       />

//       {/* Animated gradient orbs */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
//           className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-blue/30 blur-3xl" />
//         <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
//           className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-orange/20 blur-3xl" />
//         <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, repeat: Infinity, delay: 4 }}
//           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-3xl" />
//       </div>

//       {/* Floating category badges */}
//       <div className="absolute inset-0 pointer-events-none hidden lg:block">
//         {floatingBadges.map((b, i) => (
//           <motion.div key={i}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{ opacity: 1, scale: 1, rotate: b.rotate }}
//             transition={{ delay: b.delay + 1, duration: 0.5, type: 'spring' }}
//             className={`absolute ${b.x} ${b.y} glass rounded-2xl px-4 py-2 flex items-center gap-2`}
//             style={{ animation: `float ${3 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
//           >
//             <span className="text-xl">{b.icon}</span>
//             <span className="text-white text-sm font-semibold whitespace-nowrap">{b.label}</span>
//           </motion.div>
//         ))}
//       </div>

//       {/* Main content */}
//       <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-28 pb-20">

//         {/* Announcement pill */}
//         <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
//           className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-brand-orange/30">
//           <Sparkles size={14} className="text-brand-orange animate-pulse" />
//           <span className="text-white/90 text-sm font-medium">India's Most Affordable AI Courses — Starting at</span>
//           <span className="text-brand-orange font-bold text-sm">Rs 399</span>
//           <span className="text-white/60 text-xs">🎉</span>
//         </motion.div>

//         {/* Headline */}
//         <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
//           className="font-heading font-bold text-white mb-6 text-balance"
//           style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', lineHeight: 1.1 }}>
//           Apna Future Build Karo{' '}
//           <span className="relative inline-block">
//             <span className="gradient-text">AI & Tech</span>
//             <motion.span className="absolute -bottom-1 left-0 h-1 bg-brand-orange rounded-full"
//               initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 1, duration: 0.8 }} />
//           </span>{' '}
//           Se —{' '}
//           <span className="text-brand-orange">Sirf Rs 399 Mein</span>
//         </motion.h1>

//         {/* Subheading */}
//         <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
//           className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
//           Learn AI, Machine Learning, Data Science, Robotics & Cybersecurity in <strong className="text-white">Hindi</strong>.
//           Get a verifiable certificate. Become job-ready in months, not years.
//         </motion.p>

//         {/* Search bar */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
//           className="relative max-w-2xl mx-auto mb-8">
//           <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border transition-all duration-300 ${
//             focused ? 'border-brand-orange shadow-[0_0_0_4px_rgba(255,107,0,0.15)] bg-white/15' : 'border-white/20'
//           }`}>
//             <Search size={20} className={`flex-shrink-0 transition-colors ${focused ? 'text-brand-orange' : 'text-white/60'}`} />
//             <input
//               value={query}
//               onChange={e => setQuery(e.target.value)}
//               onFocus={() => setFocused(true)}
//               onBlur={() => setTimeout(() => setFocused(false), 150)}
//               onKeyDown={e => e.key === 'Enter' && handleSearch()}
//               placeholder="Kya seekhna chahte ho? e.g. Python, AI, Data Science..."
//               className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
//             />
//             <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//               onClick={() => handleSearch()}
//               className="bg-brand-orange text-white font-semibold px-5 py-2 rounded-xl text-sm flex-shrink-0 hover:bg-brand-orange-light transition-colors shadow-orange">
//               Search
//             </motion.button>
//           </div>

//           {/* Dropdown suggestions */}
//           <AnimatePresence>
//             {focused && (filtered.length > 0 || query.length === 0) && (
//               <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
//                 exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.15 }}
//                 className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden z-50">
//                 <div className="p-2">
//                   <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest px-3 py-2">
//                     {query ? 'Suggestions' : 'Popular'}
//                   </p>
//                   {(query ? filtered : suggestions).map((s) => (
//                     <button key={s} onMouseDown={() => handleSearch(s)}
//                       className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 text-left transition-colors group">
//                       <Search size={14} className="text-gray-400 group-hover:text-brand-orange" />
//                       <span className="text-sm text-gray-700 group-hover:text-brand-orange">{s}</span>
//                     </button>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </motion.div>

//         {/* CTA Buttons */}
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
//           className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
//           <Link href="/courses">
//             <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//               className="inline-flex items-center gap-2 bg-brand-orange text-white font-heading font-bold px-8 py-4 rounded-full shadow-orange-lg hover:shadow-orange text-base transition-all animate-glow-pulse">
//               Browse All Courses <ArrowRight size={18} />
//             </motion.span>
//           </Link>
//           <Link href="/demo">
//             <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
//               className="inline-flex items-center gap-2 glass text-white font-semibold px-8 py-4 rounded-full border border-white/30 hover:bg-white/15 text-base transition-all">
//               <Play size={16} className="fill-white" /> Free Demo Class
//             </motion.span>
//           </Link>
//         </motion.div>

//         {/* Social proof pills */}
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
//           className="flex flex-wrap items-center justify-center gap-4">
//           {[
//             { icon: <Users size={14} />,  text: (stats as any)?.totalStudents > 0 ? `${(stats as any).totalStudents.toLocaleString('en-IN')}+ Students` : 'Now Enrolling' },
//             ...((stats as any)?.avgRating != null ? [{ icon: <Star size={14} />, text: `${(stats as any).avgRating.toFixed(1)}/5 Rating` }] : []),
//             { icon: <Award size={14} />,  text: 'Verifiable Certificate' },
//           ].map((item, i) => (
//             <div key={i} className="flex items-center gap-1.5 glass rounded-full px-4 py-2 text-white/80 text-sm">
//               <span className="text-brand-orange">{item.icon}</span>
//               {item.text}
//             </div>
//           ))}
//         </motion.div>
//       </div>

//       {/* Scroll indicator */}
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
//         className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
//         <span className="text-xs">Scroll</span>
//         <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
//           <ChevronDown size={18} />
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Star, Users, Award, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePlatformStats } from '@/hooks/use-queries';
import Lightfall from './Lightfall';

const floatingBadges = [
  // { icon: '🤖', label: 'AI & ML',        delay: 0,    x: '-left-4',  y: 'top-20',    rotate: '-6deg' },
  // { icon: '📊', label: 'Data Science',   delay: 0.5,  x: 'right-0',  y: 'top-32',    rotate: '5deg' },
  // { icon: '🐍', label: 'Python',         delay: 1,    x: '-left-2',  y: 'bottom-32', rotate: '4deg' },
  // { icon: '🔒', label: 'Cybersecurity',  delay: 1.5,  x: 'right-2',  y: 'bottom-20', rotate: '-3deg' },
];

const suggestions = ['AI for Beginners', 'Python Hindi', 'Data Science', 'Machine Learning', 'Cybersecurity', 'Robotics Arduino'];

export function HeroSection() {
  const router     = useRouter();
  const { data: stats } = usePlatformStats();
  const [query, setQuery]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);

  // ── Search suggestions ───────────────────────────────────
  useEffect(() => {
    if (query.length > 0) {
      setFiltered(suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFiltered([]);
    }
  }, [query]);

  const handleSearch = (q?: string) => {
    const term = q ?? query;
    if (term.trim()) router.push(`/courses?q=${encodeURIComponent(term)}`);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-mesh">
      {/* Lightfall background */}
      <div className="absolute inset-0 pointer-events-none">
        <Lightfall
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          mouseInteraction={false}
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-blue/30 blur-3xl" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-orange/20 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-900/20 blur-3xl" />
      </div>

      {/* Floating category badges */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {floatingBadges.map((b, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: b.rotate }}
            transition={{ delay: b.delay + 1, duration: 0.5, type: 'spring' }}
            className={`absolute ${b.x} ${b.y} glass rounded-2xl px-4 py-2 flex items-center gap-2`}
            style={{ animation: `float ${3 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s` }}
          >
            <span className="text-xl">{b.icon}</span>
            <span className="text-white text-sm font-semibold whitespace-nowrap">{b.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-28 pb-20">

        {/* Announcement pill */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-brand-orange/30">
          <Sparkles size={14} className="text-brand-orange animate-pulse" />
          <span className="text-white/90 text-sm font-medium">India's Most Affordable AI Courses — Starting at</span>
          <span className="text-brand-orange font-bold text-sm">Rs 399</span>
          <span className="text-white/60 text-xs">🎉</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="font-heading font-bold text-white mb-6 text-balance"
          style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', lineHeight: 1.1 }}>
          Apna Future Build Karo{' '}
          <span className="relative inline-block">
            <span className="gradient-text">AI & Tech</span>
            <motion.span className="absolute -bottom-1 left-0 h-1 bg-brand-orange rounded-full"
              initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 1, duration: 0.8 }} />
          </span>{' '}
          Se —{' '}
          <span className="text-brand-orange">Sirf Rs 399 Mein</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Learn AI, Machine Learning, Data Science, Robotics & Cybersecurity in <strong className="text-white">Hindi</strong>.
          Get a verifiable certificate. Become job-ready in months, not years.
        </motion.p>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="relative max-w-2xl mx-auto mb-8">
          <div className={`flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-4 border transition-all duration-300 ${
            focused ? 'border-brand-orange shadow-[0_0_0_4px_rgba(255,107,0,0.15)] bg-white/15' : 'border-white/20'
          }`}>
            <Search size={20} className={`flex-shrink-0 transition-colors ${focused ? 'text-brand-orange' : 'text-white/60'}`} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Kya seekhna chahte ho? e.g. Python, AI, Data Science..."
              className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-base"
            />
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => handleSearch()}
              className="bg-brand-orange text-white font-semibold px-5 py-2 rounded-xl text-sm flex-shrink-0 hover:bg-brand-orange-light transition-colors shadow-orange">
              Search
            </motion.button>
          </div>

          {/* Dropdown suggestions */}
          <AnimatePresence>
            {focused && (filtered.length > 0 || query.length === 0) && (
              <motion.div initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden z-50">
                <div className="p-2">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest px-3 py-2">
                    {query ? 'Suggestions' : 'Popular'}
                  </p>
                  {(query ? filtered : suggestions).map((s) => (
                    <button key={s} onMouseDown={() => handleSearch(s)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 text-left transition-colors group">
                      <Search size={14} className="text-gray-400 group-hover:text-brand-orange" />
                      <span className="text-sm text-gray-700 group-hover:text-brand-orange">{s}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/courses">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-heading font-bold px-8 py-4 rounded-full shadow-orange-lg hover:shadow-orange text-base transition-all animate-glow-pulse">
              Browse All Courses <ArrowRight size={18} />
            </motion.span>
          </Link>
          <Link href="/demo">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 glass text-white font-semibold px-8 py-4 rounded-full border border-white/30 hover:bg-white/15 text-base transition-all">
              <Play size={16} className="fill-white" /> Free Demo Class
            </motion.span>
          </Link>
        </motion.div>

        {/* Social proof pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: <Users size={14} />,  text: (stats as any)?.totalStudents > 0 ? `${(stats as any).totalStudents.toLocaleString('en-IN')}+ Students` : 'Now Enrolling' },
            ...((stats as any)?.avgRating != null ? [{ icon: <Star size={14} />, text: `${(stats as any).avgRating.toFixed(1)}/5 Rating` }] : []),
            { icon: <Award size={14} />,  text: 'Verifiable Certificate' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 glass rounded-full px-4 py-2 text-white/80 text-sm">
              <span className="text-brand-orange">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
        <span className="text-xs">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <ChevronDown size={18} />
        </motion.div>
      </motion.div>
    </section>
  );
}