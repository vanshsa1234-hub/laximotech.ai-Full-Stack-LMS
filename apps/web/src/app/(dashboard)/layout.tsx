'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, BookOpen, Award, BarChart2, User, Settings, Home, Zap, Trophy, Users2 } from 'lucide-react';
import { useUserStats } from '@/hooks/use-queries';
import { xpToLevel } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const navItems = [
  { href: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/my-courses',   icon: BookOpen,        label: 'My Courses' },
  { href: '/dashboard/community',    icon: Users2,          label: 'Community' },
  { href: '/dashboard/progress',     icon: BarChart2,       label: 'Progress' },
  { href: '/dashboard/certificates', icon: Award,           label: 'Certificates' },
  { href: '/dashboard/leaderboard',  icon: Trophy,          label: 'Leaderboard' },
  { href: '/dashboard/profile',      icon: User,            label: 'Profile' },
  { href: '/dashboard/settings',     icon: Settings,        label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { data: stats } = useUserStats();

  const xp = stats?.xpPoints ?? 0;
  const { level, progress } = xpToLevel(xp);
  const nextLevelXp = xpToLevel(xp).nextXp;

  return (
    <div className="flex min-h-screen bg-brand-ice">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-30 pt-6 pb-4">
        <div className="px-5 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <span className="font-heading font-bold text-brand-blue">laximotech<span className="text-brand-orange">.ai</span></span>
          </Link>
        </div>

        {/* Real user identity */}
        <div className="px-5 mb-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
            {session?.user?.image
              ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              : (session?.user?.name?.[0] ?? '?')}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.name ?? 'Loading...'}
            </div>
            <div className="text-xs text-gray-400 truncate">{session?.user?.email ?? ''}</div>
          </div>
        </div>

        {/* Real XP pill */}
        <div className="mx-4 mb-6 bg-gradient-to-r from-brand-blue to-purple-700 rounded-xl p-3 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold">{xp} XP · Level {level}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.5, duration: 1 }}
              className="h-full bg-brand-orange rounded-full" />
          </div>
          <div className="text-white/60 text-[10px] mt-1">{xp} / {nextLevelXp} XP to Level {level + 1}</div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active ? 'bg-brand-blue text-white shadow-blue' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-orange'
                }`}>
                <item.icon size={18} className={active ? 'text-white' : 'text-gray-400 group-hover:text-brand-orange'} />
                {item.label}
                {active && <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 mt-4 pt-4 border-t border-gray-50 space-y-1">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-sm text-gray-500">Theme</span>
            <ThemeToggle />
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-brand-orange hover:bg-gray-50 transition-all">
            <Home size={18} /> Back to site
          </Link>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex">
        {navItems.slice(0, 5).map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${active ? 'text-brand-orange' : 'text-gray-400'}`}>
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}