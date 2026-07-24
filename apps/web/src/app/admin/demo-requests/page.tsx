'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Phone, Mail, Video, MapPin, Clock } from 'lucide-react';
import { useAdminDemoRequests, useUpdateDemoRequestStatus } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

const STATUSES = ['PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED'];

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  CONTACTED: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
  COMPLETED: 'bg-brand-green/10 text-brand-green border-brand-green/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function AdminDemoRequestsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: res, isLoading } = useAdminDemoRequests(statusFilter ? { status: statusFilter } : undefined);
  const updateStatus = useUpdateDemoRequestStatus();

  const requests = (res as any)?.data ?? [];
  const total    = (res as any)?.total ?? 0;

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl">Demo Class Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{total} demo class {total === 1 ? 'booking' : 'bookings'}</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
            statusFilter === '' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
          }`}>
          All
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === s ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No demo requests found.</div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Student', 'Topic', 'Slot / Mode', 'Status', 'Requested', 'Update'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r: any, i: number) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-white text-sm font-medium">{r.name}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1 mt-1"><Mail size={11} /> {r.email}</div>
                    <div className="text-gray-500 text-xs flex items-center gap-1"><Phone size={11} /> {r.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-300 text-sm">{r.topic}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-white text-sm"><Clock size={12} className="text-brand-orange" /> {r.slot}</div>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                      {r.mode === 'online' ? <Video size={11} /> : <MapPin size={11} />} {r.mode === 'online' ? 'Online' : 'Offline'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[r.status] ?? ''}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(r.createdAt)}</td>
                  <td className="px-5 py-4">
                    <select
                      value={r.status}
                      disabled={updateStatus.isPending}
                      onChange={e => updateStatus.mutate({ id: r.id, status: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-brand-orange cursor-pointer"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
