'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { User, Save, Linkedin, MapPin, Phone, FileText, Loader2, CheckCircle,
  Flame, Zap, Award, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { usersApi } from '@/lib/api';
import { useProfile, useUserStats } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { StudentIdCard } from '@/components/profile/student-id-card';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: profile }   = useProfile();
  const { data: userStats } = useUserStats();
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', bio: '', city: '', phone: '', linkedinUrl: '', weeklyGoal: 3,
  });

  // Load profile from API
  useEffect(() => {
    usersApi.me().then(res => {
      const u = res.data;
      setForm({
        name:        u.name        ?? '',
        bio:         u.bio         ?? '',
        city:        u.city        ?? '',
        phone:       u.phone       ?? '',
        linkedinUrl: u.linkedinUrl ?? '',
        weeklyGoal:  u.weeklyGoal  ?? 3,
      });
    }).catch(() => {
      // Fallback to session data
      setForm(p => ({ ...p, name: session?.user?.name ?? '' }));
    }).finally(() => setLoading(false));
  }, [session]);

  const handleChange = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.update(form);
      setSaved(true);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-ice pt-6 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 dark:text-gray-100 text-2xl mb-8 flex items-center gap-2">
          <User size={24} className="text-brand-blue" /> My Profile
        </h1>

        {/* Digital Student ID card — a real 3D lanyard card carrying your
            actual profile data, front and back. Drag it to spin, or use the
            flip button. */}
        {profile && (
          <div className="mb-8">
            <StudentIdCard
              name={form.name || session?.user?.name || 'Student'}
              email={session?.user?.email ?? ''}
              photoUrl={session?.user?.image ?? null}
              role={profile?.role}
              joinedAt={profile?.createdAt}
              studentId={`LXT-${String(profile.id).slice(-6).toUpperCase()}`}
              coursesEnrolled={profile?._count?.enrollments ?? 0}
              certificatesEarned={profile?._count?.certificates ?? 0}
            />
          </div>
        )}

        {/* User Card — real stats, no placeholder text */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-blue to-purple-700 rounded-2xl p-6 shadow-card mb-6 text-white overflow-hidden relative">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden border-2 border-white/20">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt={form.name} className="w-full h-full object-cover" />
              ) : (
                (form.name || session?.user?.name || 'U')[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-white text-xl truncate">{form.name || session?.user?.name}</div>
              <div className="text-white/70 text-sm truncate">{session?.user?.email}</div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                  {(profile?.role ?? 'STUDENT').toLowerCase()}
                </span>
                {profile?.createdAt && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <Calendar size={11} /> Joined {formatDate(profile.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <Flame size={16} className="mx-auto mb-1 text-orange-300" />
              <div className="font-heading font-bold text-lg">{profile?.streakDays ?? 0}</div>
              <div className="text-white/60 text-[11px]">Day Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <Zap size={16} className="mx-auto mb-1 text-yellow-300" />
              <div className="font-heading font-bold text-lg">{profile?.xpPoints ?? 0}</div>
              <div className="text-white/60 text-[11px]">Total XP</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <BookOpen size={16} className="mx-auto mb-1 text-blue-200" />
              <div className="font-heading font-bold text-lg">{profile?._count?.enrollments ?? 0}</div>
              <div className="text-white/60 text-[11px]">Courses Enrolled</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
              <Award size={16} className="mx-auto mb-1 text-green-200" />
              <div className="font-heading font-bold text-lg">{profile?._count?.certificates ?? 0}</div>
              <div className="text-white/60 text-[11px]">Certificates</div>
            </div>
          </div>

          {userStats?.completedCourses != null && (
            <div className="mt-4 pt-4 border-t border-white/15 flex items-center gap-2 text-sm text-white/80">
              <GraduationCap size={15} />
              <span>
                <strong>{userStats.completedCourses}</strong> of <strong>{profile?._count?.enrollments ?? 0}</strong> courses completed
                {userStats.totalWatchedHrs != null && <> · <strong>{userStats.totalWatchedHrs}h</strong> watched total</>}
              </span>
            </div>
          )}
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 mb-6 space-y-5">
          <h2 className="font-heading font-semibold text-gray-900 mb-1">Personal Information</h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.name} onChange={e => handleChange('name', e.target.value)}
                className="input pl-10" placeholder="Your full name" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <FileText size={14} /> Bio
            </label>
            <textarea value={form.bio} onChange={e => handleChange('bio', e.target.value)}
              rows={3} placeholder="Tell us about yourself..." className="input resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <MapPin size={14} /> City
              </label>
              <input value={form.city} onChange={e => handleChange('city', e.target.value)}
                className="input" placeholder="e.g. Greater Noida" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Phone size={14} /> Phone
              </label>
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                className="input" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <Linkedin size={14} /> LinkedIn URL
            </label>
            <input value={form.linkedinUrl} onChange={e => handleChange('linkedinUrl', e.target.value)}
              className="input" placeholder="https://linkedin.com/in/yourname" />
          </div>
        </motion.div>

        {/* Weekly goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-card border border-gray-100 mb-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Weekly Learning Goal</h2>
          <p className="text-gray-500 text-sm mb-4">How many lessons do you want to complete per week?</p>
          <div className="flex gap-3 flex-wrap">
            {[1, 2, 3, 5, 7, 10].map(n => (
              <button key={n} onClick={() => handleChange('weeklyGoal', n)}
                className={`w-14 h-14 rounded-xl font-heading font-bold text-lg transition-all ${
                  form.weeklyGoal === n
                    ? 'bg-brand-orange text-white shadow-orange'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-brand-orange hover:text-brand-orange'
                }`}>
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Current: <strong>{form.weeklyGoal} lessons/week</strong></p>
        </motion.div>

        {/* Save */}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={handleSave} disabled={saving}
          className="w-full btn-primary justify-center py-4 disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
           : saved  ? <><CheckCircle size={16} /> Saved!</>
           : <><Save size={16} /> Save Profile</>}
        </motion.button>
      </div>
    </main>
  );
}