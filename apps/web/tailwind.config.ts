import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Brand Colors ──────────────────────────────────────
      colors: {
        brand: {
          blue:       '#1F4E79', // Deep Blue — headers, CTAs, logo
          'blue-light': '#2563EB',
          'blue-dark':  '#163A5C',
          orange:     '#FF6B00', // Energy Orange — buy buttons, price badge
          'orange-light': '#FF8534',
          'orange-dark':  '#E05C00',
          green:      '#117A65', // Emerald — certificates, progress
          'green-light': '#1abc9c',
          ice:        '#F0F8FF', // Ice Blue — page background, cards
          dark:       '#1A1A2E', // Near Black — body text
        },
      },

      // ── Typography ───────────────────────────────────────
      fontFamily: {
        sans:    ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-poppins)', 'sans-serif'],
        serif:   ['var(--font-playfair)', 'serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },

      // ── Font Sizes ───────────────────────────────────────
      fontSize: {
        'hero':  ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.1', fontWeight: '700' }],
        'h1':    ['clamp(2rem, 4vw, 3rem)',      { lineHeight: '1.15', fontWeight: '700' }],
        'h2':    ['clamp(1.5rem, 3vw, 2rem)',    { lineHeight: '1.2',  fontWeight: '600' }],
        'h3':    ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.3',  fontWeight: '600' }],
        'price': ['1.5rem',                       { lineHeight: '1',    fontWeight: '700' }],
      },

      // ── Animations ───────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(255, 107, 0, 0.6)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'gradient-shift': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'particle-float': {
          '0%':   { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(-100px) rotate(720deg)', opacity: '0' },
        },
        'count-up': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'search-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 107, 0, 0)' },
          '50%':      { boxShadow: '0 0 0 4px rgba(255, 107, 0, 0.2)' },
        },
        'card-lift': {
          '0%':   { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-6px) scale(1.01)' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-up':        'fade-up 0.6s ease-out forwards',
        'fade-up-slow':   'fade-up 0.9s ease-out forwards',
        'fade-in':        'fade-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
        'float':          'float 3s ease-in-out infinite',
        'float-slow':     'float 5s ease-in-out infinite',
        'glow-pulse':     'glow-pulse 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'bounce-soft':    'bounce-soft 2s ease-in-out infinite',
        'scale-in':       'scale-in 0.3s ease-out forwards',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'particle-float': 'particle-float linear infinite',
        'count-up':       'count-up 0.4s ease-out forwards',
        'search-glow':    'search-glow 2s ease-in-out infinite',
        'spin-slow':      'spin-slow 20s linear infinite',
      },

      // ── Gradients ─────────────────────────────────────────
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, #0f1729 0%, #1F4E79 40%, #2d1b69 70%, #1a0a2e 100%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'orange-gradient':
          'linear-gradient(135deg, #FF6B00 0%, #FF8534 100%)',
        'shimmer-gradient':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        'mesh-gradient':
          'radial-gradient(at 40% 20%, #1F4E79 0px, transparent 50%), radial-gradient(at 80% 0%, #2d1b69 0px, transparent 50%), radial-gradient(at 0% 50%, #117A65 0px, transparent 50%)',
      },

      // ── Box Shadows ───────────────────────────────────────
      boxShadow: {
        'card':       '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.14)',
        'orange':     '0 8px 24px rgba(255, 107, 0, 0.35)',
        'orange-lg':  '0 12px 40px rgba(255, 107, 0, 0.45)',
        'blue':       '0 8px 24px rgba(31, 78, 121, 0.3)',
        'glow':       '0 0 40px rgba(255, 107, 0, 0.2)',
        'glass':      '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.15)',
      },

      // ── Border Radius ─────────────────────────────────────
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ── Backdrop Blur ─────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ── Z-Index ───────────────────────────────────────────
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};

export default config;
