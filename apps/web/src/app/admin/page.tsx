'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, ArrowUpRight, IndianRupee, Loader2, CalendarCheck } from 'lucide-react';
import Link from 'next/link';
import { useAdminStats } from '@/hooks/use-queries';
import { timeAgo } from '@/lib/utils';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const s = stats as any;

  const STATS = [
    { label: 'Total Students',    value: s?.totalStudents?.toLocaleString('en-IN') ?? '0', icon: Users,        color: 'bg-blue-500/10   text-blue-400' },
    { label: 'Total Revenue',     value: `Rs ${(((s?.totalRevenueRs ?? 0))/100000).toFixed(2)}L`, icon: IndianRupee, color: 'bg-green-500/10  text-green-400' },
    { label: 'Courses Published', value: s?.totalCourses ?? 0,      icon: BookOpen,     color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Certificates',      value: s?.totalCertificates?.toLocaleString('en-IN') ?? '0', icon: Award, color: 'bg-orange-500/10 text-orange-400' },
    { label: 'Pending Demo Requests', value: s?.pendingDemoRequests ?? 0, icon: CalendarCheck, color: 'bg-pink-500/10 text-pink-400', href: '/admin/demo-requests' },
  ];

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">laximotech.ai · Live data from database</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="text-brand-orange animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {STATS.map((stat, i) => {
              const Card = (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-gray-700 transition-colors h-full">
                  <div className={`w-10 h-10 rounded-xl ${stat.color.split(' ')[0]} flex items-center justify-center mb-4`}>
                    <stat.icon size={18} className={stat.color.split(' ')[1]} />
                  </div>
                  <div className="font-heading font-bold text-white text-2xl mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-xs">{stat.label}</div>
                </motion.div>
              );
              return (stat as any).href ? (
                <Link key={i} href={(stat as any).href}>{Card}</Link>
              ) : (
                <div key={i}>{Card}</div>
              );
            })}
          </div>

          {/* Recent orders — real data */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="font-heading font-semibold text-white">Recent Orders</h3>
            </div>
            {(!s?.recentOrders || s.recentOrders.length === 0) ? (
              <p className="text-gray-500 text-sm text-center py-10">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Student', 'Course', 'Amount', 'Status', 'Time'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.recentOrders.map((order: any, i: number) => (
                      <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3 text-white text-sm font-medium">{order.user?.name ?? order.user?.email}</td>
                        <td className="px-5 py-3 text-gray-300 text-sm truncate max-w-[200px]">{order.course?.title}</td>
                        <td className="px-5 py-3 text-brand-green text-sm font-semibold">Rs {Math.round(order.amount / 100)}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-bold bg-green-500/10 text-green-400 px-2 py-1 rounded-full">PAID</span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{timeAgo(order.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
