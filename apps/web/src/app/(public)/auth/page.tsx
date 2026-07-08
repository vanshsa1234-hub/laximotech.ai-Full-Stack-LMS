'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff,
  CheckCircle, AlertCircle, Chrome, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { clearTokenCache } from '@/lib/get-token';

type Mode   = 'login'  | 'signup' | 'forgot' | 'forgot-sent';
type Method = 'password' | 'magic';

const validateEmail    = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const validatePassword = (p: string) => p.length >= 8;

/**
 * Defined OUTSIDE the page component on purpose. Defining an input
 * component inline inside a parent function body means React sees a
 * brand-new component type on every parent re-render (every keystroke),
 * which unmounts/remounts the <input> and loses focus after one
 * character. This was the root cause of "only one letter types at a time."
 */
function Field({
  label, value, onChange, type = 'text', placeholder, error, icon: Icon, rightSlot,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  icon: React.ElementType;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`input pl-10 pr-10 h-12 transition-all ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}`}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl'); // set by middleware when bounced from a protected route

  const [mode,      setMode]      = useState<Mode>('login');
  const [method,    setMethod]    = useState<Method>('password');
  const [loading,   setLoading]   = useState<string | null>(null);
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPwd2,  setShowPwd2]  = useState(false);

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const clearError = (field: string) => setErrors(p => ({ ...p, [field]: '' }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!validateEmail(email)) errs.email = 'Valid email required';
    if (method === 'password') {
      if (!validatePassword(password)) errs.password = 'Min 8 characters';
      if (mode === 'signup' && password !== password2) errs.password2 = 'Passwords do not match';
      if (mode === 'signup' && !name.trim()) errs.name = 'Name required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoogle = async () => {
    setLoading('google');
    await signIn('google', { callbackUrl: callbackUrl || '/post-login' });
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading('password');
    try {
      if (mode === 'signup') {
        await authApi.register({ name, email, password });
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        toast.error('Invalid email or password.');
        return;
      }
      clearTokenCache(); // ensure the very next API call fetches a fresh token, not a stale cached null
      toast.success(mode === 'signup' ? 'Account created! Welcome 🎉' : 'Welcome back! 👋');

      // If we were bounced here from a protected route (e.g. /admin), go back
      // there — middleware will re-verify role on arrival either way.
      // Otherwise, send admins straight to the admin panel, everyone else to
      // their dashboard.
      let destination = callbackUrl || '/dashboard';
      if (!callbackUrl) {
        const freshSession = await getSession();
        if ((freshSession?.user as any)?.role === 'ADMIN') destination = '/admin';
      }
      router.push(destination);
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setErrors({ email: 'Valid email required' }); return; }
    setLoading('magic');
    await signIn('resend', { email, callbackUrl: callbackUrl || '/post-login', redirect: false });
    setMode('forgot-sent');
    setLoading(null);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { setErrors({ email: 'Valid email required' }); return; }
    setLoading('forgot');
    try {
      await authApi.forgotPassword(email);
      setMode('forgot-sent');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1,1.2,1], opacity: [0.3,0.5,0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-blue/30 blur-3xl" />
        <motion.div animate={{ scale: [1.2,1,1.2], opacity: [0.2,0.4,0.2] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-brand-orange/20 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }} className="w-full max-w-md relative z-10">

        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center shadow-orange">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="font-heading font-bold text-2xl text-white">
              laximotech<span className="text-brand-orange">.ai</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <AnimatePresence mode="wait">

            {mode === 'forgot-sent' && (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-brand-green" />
                </motion.div>
                <h3 className="font-heading font-bold text-gray-900 text-xl mb-2">Check your email!</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  We sent a link to <strong className="text-gray-900">{email}</strong>.
                  {method === 'magic' ? ' Click it to sign in — no password needed.' : ' Click it to reset your password.'}
                </p>
                <button onClick={() => { setMode('login'); setMethod('password'); }}
                  className="text-brand-blue text-sm font-semibold hover:text-brand-orange transition-colors">
                  ← Back to login
                </button>
              </motion.div>
            )}

            {mode === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="font-heading font-bold text-gray-900 text-xl mb-1">Forgot Password?</h2>
                <p className="text-gray-500 text-sm mb-6">Enter your email — we'll send a reset link.</p>
                <form onSubmit={handleForgot} className="space-y-4">
                  <Field label="Email" value={email} onChange={v => { setEmail(v); clearError('email'); }}
                    type="email" placeholder="you@example.com" error={errors.email} icon={Mail} />
                  <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    disabled={!!loading} className="w-full btn-primary justify-center py-3.5 h-12 disabled:opacity-60">
                    {loading === 'forgot' ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <>Send Reset Link <ArrowRight size={16} /></>}
                  </motion.button>
                </form>
                <button onClick={() => setMode('login')} className="mt-4 text-gray-400 hover:text-gray-600 text-sm transition-colors">
                  ← Back to login
                </button>
              </motion.div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  {(['login','signup'] as const).map(m => (
                    <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        mode === m ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {m === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                  ))}
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={handleGoogle} disabled={!!loading}
                  className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:border-brand-orange hover:text-brand-orange transition-all mb-4 disabled:opacity-60">
                  {loading === 'google' ? <Loader2 size={18} className="animate-spin" /> : <Chrome size={18} />}
                  Continue with Google
                </motion.button>

                <div className="flex gap-2 mb-4">
                  {(['password','magic'] as Method[]).map(m => (
                    <button key={m} onClick={() => { setMethod(m); setErrors({}); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        method === m ? 'bg-brand-blue/5 border-brand-blue text-brand-blue' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      {m === 'password' ? <><Lock size={11} /> Password</> : <><Sparkles size={11} /> Magic Link</>}
                    </button>
                  ))}
                </div>

                {method === 'password' && (
                  <form onSubmit={handlePasswordAuth} className="space-y-4">
                    {mode === 'signup' && (
                      <Field label="Full Name" value={name} onChange={v => { setName(v); clearError('name'); }}
                        placeholder="Rahul Sharma" error={errors.name} icon={User} />
                    )}
                    <Field label="Email" value={email} onChange={v => { setEmail(v); clearError('email'); }}
                      type="email" placeholder="you@example.com" error={errors.email} icon={Mail} />
                    <Field label="Password" value={password} onChange={v => { setPassword(v); clearError('password'); }}
                      type={showPwd ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? 'Min 8 characters' : 'Your password'}
                      error={errors.password} icon={Lock}
                      rightSlot={
                        <button type="button" onClick={() => setShowPwd(p => !p)} className="text-gray-400 hover:text-gray-600 transition-colors">
                          {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      } />
                    {mode === 'signup' && (
                      <Field label="Confirm Password" value={password2} onChange={v => { setPassword2(v); clearError('password2'); }}
                        type={showPwd2 ? 'text' : 'password'} placeholder="Repeat password"
                        error={errors.password2} icon={Lock}
                        rightSlot={
                          <button type="button" onClick={() => setShowPwd2(p => !p)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        } />
                    )}

                    {mode === 'login' && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => { setMode('forgot'); setErrors({}); }}
                          className="text-xs text-brand-blue hover:text-brand-orange transition-colors font-semibold">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      disabled={!!loading}
                      className="w-full btn-primary justify-center py-3.5 h-12 disabled:opacity-60 disabled:cursor-not-allowed">
                      {loading === 'password'
                        ? <><Loader2 size={16} className="animate-spin" /> {mode === 'signup' ? 'Creating account...' : 'Logging in...'}</>
                        : <>{mode === 'signup' ? 'Create Account' : 'Log In'} <ArrowRight size={16} /></>}
                    </motion.button>
                  </form>
                )}

                {method === 'magic' && (
                  <form onSubmit={handleMagicLink} className="space-y-4">
                    <Field label="Email" value={email} onChange={v => { setEmail(v); clearError('email'); }}
                      type="email" placeholder="you@example.com" error={errors.email} icon={Mail} />
                    <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      disabled={!!loading} className="w-full btn-primary justify-center py-3.5 h-12 disabled:opacity-60">
                      {loading === 'magic' ? <><Loader2 size={16} className="animate-spin" /> Sending link...</> : <><Sparkles size={16} /> Send Magic Link</>}
                    </motion.button>
                    <p className="text-center text-xs text-gray-400">We'll email you a one-click login link — no password needed</p>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-brand-blue hover:underline">Terms</Link> &{' '}
            <Link href="/privacy" className="text-brand-blue hover:underline">Privacy Policy</Link>
          </p>
        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          <Link href="/" className="hover:text-white transition-colors">← Back to laximotech.ai</Link>
        </p>
      </motion.div>
    </div>
  );
}
