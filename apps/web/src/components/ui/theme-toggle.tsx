'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

/**
 * Animated light/dark toggle. Defaults to the device's system preference
 * (via next-themes' `enableSystem`), and remembers a manual choice once the
 * person clicks it. Safe to render anywhere — waits for mount before
 * reading the theme to avoid a server/client hydration mismatch, since the
 * real theme is only knowable in the browser.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center h-8 w-14 rounded-full p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${
        isDark ? 'bg-brand-blue-dark' : 'bg-brand-ice border border-gray-200'
      } ${className}`}
    >
      <span className="sr-only">Toggle theme</span>

      {/* Background icons, faded, for context while the knob slides */}
      <Sun size={13} className={`absolute left-1.5 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-40 text-brand-orange'}`} />
      <Moon size={13} className={`absolute right-1.5 transition-opacity duration-300 ${isDark ? 'opacity-70 text-amber-200' : 'opacity-0'}`} />

      {/* Sliding knob */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md"
        style={{ marginLeft: isDark ? 'calc(100% - 1.5rem)' : '0' }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mounted && (
            <motion.span
              key={isDark ? 'moon' : 'sun'}
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              {isDark
                ? <Moon size={13} className="text-amber-400 fill-amber-400" style={{ filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.7))' }} />
                : <Sun size={13} className="text-brand-orange fill-brand-orange" />}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}