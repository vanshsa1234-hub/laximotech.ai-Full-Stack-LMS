'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, ChevronDown, BookOpen, Brain,
  Database, Shield, Cpu, GraduationCap, LogOut, User, Settings,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navLinks = [
  {
    label: 'Courses',
    href:  '/courses',
    mega:  [
      { icon: Brain,    label: 'AI & Machine Learning', href: '/courses?cat=ai',            badge: 'Hot' },
      { icon: Database, label: 'Data Science',           href: '/courses?cat=data-science',  badge: '' },
      { icon: BookOpen, label: 'Programming',            href: '/courses?cat=programming',   badge: '' },
      { icon: Cpu,      label: 'Robotics & IoT',         href: '/courses?cat=robotics',      badge: 'New' },
      { icon: Shield,   label: 'Cybersecurity',          href: '/courses?cat=cybersecurity', badge: '' },
    ],
  },
  { label: 'Career Paths', href: '/paths' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Demo Class',   href: '/demo', highlight: true },
];

export function Navbar() {
  const { data: session } = useSession();
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [megaOpen,     setMegaOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [profileOpen,  setProfileOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[#0B0F1A]/85 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] border-b border-gray-100 dark:border-gray-800'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ── Logo ─────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center shadow-blue"
              >
                <span className="text-white font-heading font-bold text-lg">L</span>
              </motion.div>
              <div>
                <span className={`font-heading font-bold text-lg leading-none transition-colors ${
                  scrolled ? 'text-brand-blue dark:text-white' : 'text-white'
                }`}>
                  laximotech
                </span>
                <span className="text-brand-orange font-bold text-lg">.ai</span>
              </div>
            </Link>

            {/* ── Desktop Nav ───────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div key={link.label} className="relative">
                  {link.mega ? (
                    <button
                      onMouseEnter={() => setMegaOpen(true)}
                      onMouseLeave={() => setMegaOpen(false)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        scrolled ? 'text-gray-700 dark:text-gray-200 hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-white/5' : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                      <motion.span animate={{ rotate: megaOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} />
                      </motion.span>
                    </button>
                  ) : link.highlight ? (
                    <Link href={link.href}>
                      <motion.span
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-block bg-brand-orange text-white text-sm font-semibold px-4 py-2 rounded-full shadow-orange hover:shadow-orange-lg transition-all"
                      >
                        {link.label} 🎯
                      </motion.span>
                    </Link>
                  ) : (
                    <Link
                      href={link.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        scrolled ? 'text-gray-700 dark:text-gray-200 hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-white/5' : 'text-white/90 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {/* Mega menu dropdown */}
                  {link.mega && (
                    <AnimatePresence>
                      {megaOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          onMouseEnter={() => setMegaOpen(true)}
                          onMouseLeave={() => setMegaOpen(false)}
                          className="absolute top-full left-0 w-72 mt-2 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 p-2 overflow-hidden"
                        >
                          <div className="px-3 py-2 mb-1 border-b border-gray-50">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                              Categories
                            </p>
                          </div>
                          {link.mega.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-50 group transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-orange/10 transition-colors flex-shrink-0">
                                <item.icon size={16} className="text-brand-blue group-hover:text-brand-orange transition-colors" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-brand-orange transition-colors flex-1">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-bold bg-brand-orange text-white px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                          <div className="mt-2 pt-2 border-t border-gray-50 px-3 py-2">
                            <Link href="/courses" className="text-xs text-brand-blue font-semibold hover:text-brand-orange transition-colors">
                              View all 25 courses →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Right Actions ─────────────────────────── */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <ThemeToggle className="hidden sm:inline-flex" />

              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className={`p-2 rounded-lg transition-all ${
                  scrolled ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Search size={20} />
              </motion.button>

              {/* Auth */}
              {session ? (
                <div className="relative hidden lg:block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setProfileOpen(p => !p)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="Avatar" width={32} height={32} className="rounded-full" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {session.user?.name?.[0] ?? 'U'}
                        </span>
                      )}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-gray-100 p-2"
                      >
                        <div className="px-3 py-2 mb-1 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-900 truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                        </div>
                        {[
                          { icon: GraduationCap, label: 'My Dashboard',  href: '/dashboard' },
                          { icon: User,          label: 'Profile',        href: '/dashboard/profile' },
                          { icon: Settings,      label: 'Settings',       href: '/dashboard/settings' },
                        ].map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-orange-50 text-sm text-gray-700 hover:text-brand-orange transition-colors"
                          >
                            <item.icon size={15} /> {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-500 transition-colors mt-1 border-t border-gray-50"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signIn()}
                    className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                      scrolled ? 'text-brand-blue dark:text-white hover:bg-brand-blue/10 dark:hover:bg-white/10' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Log In
                  </motion.button>
                  <Link href="/auth?mode=signup">
                    <motion.span
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-block btn-primary text-sm px-5 py-2.5"
                    >
                      Start Learning — Free
                    </motion.span>
                  </Link>
                </div>
              )}

              {/* Mobile burger */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(p => !p)}
                className={`lg:hidden p-2 rounded-lg transition-all ${
                  scrolled ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10' : 'text-white hover:bg-white/10'
                }`}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ───────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                <div className="flex items-center justify-between px-4 py-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">Theme</span>
                  <ThemeToggle />
                </div>
                {navLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.href ?? '#'}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        link.highlight
                          ? 'bg-brand-orange text-white font-semibold'
                          : 'text-gray-700 hover:bg-orange-50 hover:text-brand-orange'
                      }`}
                    >
                      {link.label}
                    </Link>
                    {link.mega && link.mega.map(sub => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 pl-8 py-2 text-sm text-gray-500 hover:text-brand-orange"
                      >
                        <sub.icon size={14} /> {sub.label}
                      </Link>
                    ))}
                  </div>
                ))}
                {!session && (
                  <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                    <button onClick={() => signIn()} className="btn-outline w-full text-sm">Log In</button>
                    <Link href="/auth?mode=signup" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-sm text-center">
                      Start Learning — Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Global Search Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Search size={20} className="text-brand-orange flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, topics, career paths…"
                  className="flex-1 text-base outline-none text-gray-900 placeholder:text-gray-400"
                />
                <kbd className="hidden sm:block text-xs text-gray-400 border border-gray-200 rounded px-2 py-1">ESC</kbd>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {['AI for Beginners', 'Python Hindi', 'Data Science', 'Rs 399 courses', 'Cybersecurity', 'Arduino'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="text-sm px-3 py-1.5 bg-gray-50 hover:bg-orange-50 hover:text-brand-orange text-gray-600 rounded-full transition-colors border border-gray-100"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              {searchQuery && (
                <div className="px-5 pb-4 border-t border-gray-50">
                  <Link
                    href={`/courses?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-2 mt-3 text-sm text-brand-blue font-semibold hover:text-brand-orange"
                  >
                    <Search size={14} />
                    Search for "{searchQuery}" →
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}