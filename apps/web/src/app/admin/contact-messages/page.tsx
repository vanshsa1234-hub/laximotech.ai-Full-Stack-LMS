'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { useAdminContactMessages, useUpdateContactMessageStatus } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

const STATUSES = ['NEW', 'READ', 'RESPONDED'];

const STATUS_STYLES: Record<string, string> = {
  NEW:       'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  READ:      'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
  RESPONDED: 'bg-brand-green/10 text-brand-green border-brand-green/30',
};

export default function AdminContactMessagesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: res, isLoading } = useAdminContactMessages(statusFilter ? { status: statusFilter } : undefined);
  const updateStatus = useUpdateContactMessageStatus();

  const messages = (res as any)?.data ?? [];
  const total    = (res as any)?.total ?? 0;

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl">Contact Messages</h1>
        <p className="text-gray-500 text-sm mt-1">{total} {total === 1 ? 'message' : 'messages'} from the contact form</p>
      </div>

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
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No messages yet.</div>
      ) : (
        <div className="space-y-3">
          {messages.map((m: any, i: number) => (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={14} className="text-brand-orange" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium">{m.name} · <span className="text-gray-500 font-normal">{m.email}</span></div>
                    <div className="text-gray-500 text-xs mt-0.5">{m.subject} — {formatDate(m.createdAt)}</div>
                  </div>
                </div>
                <select value={m.status} disabled={updateStatus.isPending}
                  onChange={e => updateStatus.mutate({ id: m.id, status: e.target.value })}
                  className={`bg-gray-800 border rounded-lg px-2 py-1.5 text-xs font-semibold outline-none cursor-pointer flex-shrink-0 ${STATUS_STYLES[m.status] ?? ''}`}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap pl-12">{m.message}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
