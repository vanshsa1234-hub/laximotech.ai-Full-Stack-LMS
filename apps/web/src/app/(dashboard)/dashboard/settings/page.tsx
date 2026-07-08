'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, Bell, Globe, Shield, LogOut, Trash2, ChevronRight, KeyRound, Loader2, Check } from 'lucide-react';
import { authApi, usersApi } from '@/lib/api';
import { useProfile } from '@/hooks/use-queries';
import toast from 'react-hot-toast';

const DEFAULT_PREFS = { notifications: { email: true, streak: true, weekly: false }, language: 'hi' as 'hi' | 'en' };

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const [notifs, setNotifs] = useState(DEFAULT_PREFS.notifications);
  const [lang,   setLang]   = useState<'hi'|'en'>(DEFAULT_PREFS.language);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [pwd, setPwd]       = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Load the real saved preferences once the profile has loaded — previously
  // these always started from hardcoded defaults and silently forgot
  // whatever you toggled the moment you left the page.
  useEffect(() => {
    if (profile?.preferences) {
      setNotifs({ ...DEFAULT_PREFS.notifications, ...(profile.preferences.notifications ?? {}) });
      setLang(profile.preferences.language ?? DEFAULT_PREFS.language);
    }
  }, [profile]);

  const savePreferences = async (nextNotifs: typeof notifs, nextLang: typeof lang) => {
    setSavingPrefs(true);
    try {
      await usersApi.update({ preferences: { notifications: nextNotifs, language: nextLang } });
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    } catch {
      toast.error('Failed to save preference.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    savePreferences(next, lang);
  };

  const changeLang = (code: 'hi' | 'en') => {
    setLang(code);
    savePreferences(notifs, code);
  };

  const handleChangePwd = async () => {
    if (!pwd.current || !pwd.newPwd) return toast.error('Fill in all password fields');
    if (pwd.newPwd.length < 8)       return toast.error('New password must be at least 8 characters');
    if (pwd.newPwd !== pwd.confirm)  return toast.error('Passwords do not match');
    setPwdLoading(true);
    try {
      await authApi.changePassword({ currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success('Password changed successfully!');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 text-2xl mb-8 flex items-center gap-2">
          <Settings size={24} className="text-brand-blue"/> Settings
        </h1>

        {/* Notifications */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
          className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-brand-orange"/>
              <span className="font-semibold text-gray-900 text-sm">Notifications</span>
            </div>
            {savingPrefs && <Loader2 size={12} className="animate-spin text-gray-400" />}
          </div>
          {[
            {key:'email', label:'Email notifications',   sub:'Course updates and promotions'},
            {key:'streak',label:'Streak reminders',      sub:'Daily reminder to keep your streak'},
            {key:'weekly',label:'Weekly progress report',sub:'Summary of your learning each week'},
          ].map(item=>(
            <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
              <div>
                <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                <div className="text-gray-400 text-xs">{item.sub}</div>
              </div>
              <button onClick={()=>toggleNotif(item.key as keyof typeof notifs)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${notifs[item.key as keyof typeof notifs]?'bg-brand-green':'bg-gray-200'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${notifs[item.key as keyof typeof notifs]?'left-5':'left-0.5'}`}/>
              </button>
            </div>
          ))}
        </motion.div>

        {/* Language */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
          className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Globe size={16} className="text-brand-blue"/>
            <span className="font-semibold text-gray-900 text-sm">Language</span>
          </div>
          <div className="p-5 flex gap-3">
            {([['hi','🇮🇳 Hindi + English'],['en','🇬🇧 English Only']] as const).map(([code,label])=>(
              <button key={code} onClick={()=>changeLang(code)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm border transition-all ${lang===code?'bg-brand-blue text-white border-brand-blue':'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-blue'}`}>
                {label}
              </button>
            ))}
          </div>
          <p className="px-5 pb-4 text-xs text-gray-400">
            Saved to your account for future use — course content itself is currently Hindi + English mixed regardless of this setting.
          </p>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
          className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <KeyRound size={16} className="text-brand-green"/>
            <span className="font-semibold text-gray-900 text-sm">Change Password</span>
          </div>
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
              <input type="password" value={pwd.current} onChange={e=>setPwd(p=>({...p,current:e.target.value}))}
                className="input h-10 text-sm" placeholder="Current password"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password (min 8 chars)</label>
              <input type="password" value={pwd.newPwd} onChange={e=>setPwd(p=>({...p,newPwd:e.target.value}))}
                className="input h-10 text-sm" placeholder="New password"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
              <input type="password" value={pwd.confirm} onChange={e=>setPwd(p=>({...p,confirm:e.target.value}))}
                className="input h-10 text-sm" placeholder="Confirm new password"/>
            </div>
            <button onClick={handleChangePwd} disabled={pwdLoading}
              className="btn-secondary text-sm px-5 py-2.5 disabled:opacity-60 flex items-center gap-2">
              {pwdLoading?<><Loader2 size={14} className="animate-spin"/>Saving...</>:'Update Password'}
            </button>
            <p className="text-xs text-gray-400">Note: Only applies if you registered with email & password.</p>
          </div>
        </motion.div>

        {/* Legal links */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
          className="bg-white rounded-2xl shadow-card border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Shield size={16} className="text-brand-green"/>
            <span className="font-semibold text-gray-900 text-sm">Legal</span>
          </div>
          {[
            {label:'Privacy Policy',   href:'/privacy'},
            {label:'Terms of Service', href:'/terms'},
          ].map(item=>(
            <a key={item.label} href={item.href}
              className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700 text-sm">{item.label}</span>
              <ChevronRight size={14} className="text-gray-400"/>
            </a>
          ))}
        </motion.div>

        {/* Danger zone */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="space-y-3">
          <button onClick={()=>signOut({callbackUrl:'/'})}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 hover:text-brand-orange hover:border-brand-orange transition-all text-sm">
            <LogOut size={16}/> Sign Out
          </button>
          <button onClick={()=>toast.error('Contact support@laximotech.ai to delete your account')}
            className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-500 font-semibold py-3.5 rounded-xl hover:bg-red-100 transition-all text-sm">
            <Trash2 size={16}/> Delete Account
          </button>
        </motion.div>
      </div>
    </main>
  );
}
