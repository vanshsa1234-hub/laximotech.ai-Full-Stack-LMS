'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, ShoppingBag,
  FileText, Tag, BarChart2, Settings, ExternalLink, Shield
} from 'lucide-react';

const navItems = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/courses',   icon: BookOpen,        label: 'Courses' },
  { href: '/admin/students',  icon: Users,           label: 'Students' },
  { href: '/admin/analytics', icon: BarChart2,       label: 'Analytics' },
  { href: '/admin/blog',      icon: FileText,        label: 'Blog' },
  { href: '/admin/coupons',   icon: Tag,             label: 'Coupons' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 border-r border-gray-800 fixed top-0 left-0 h-full flex flex-col z-30">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-orange flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-heading font-bold text-sm">laximotech</div>
              <div className="text-gray-500 text-[10px] uppercase tracking-widest">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-brand-orange text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <item.icon size={16} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
            <ExternalLink size={14} /> View Site
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 ml-60 min-h-screen">
        {children}
      </div>
    </div>
  );
}
