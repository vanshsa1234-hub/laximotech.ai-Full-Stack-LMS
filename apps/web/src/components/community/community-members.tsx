'use client';

import { useState } from 'react';
import { Search, Zap, ShieldCheck } from 'lucide-react';
import { useCommunityMembers } from '@/hooks/use-queries';

export function CommunityMembers({ onOpenProfile }: { onOpenProfile: (userId: string) => void }) {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useCommunityMembers(search);
  const members = data?.members ?? [];

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-card">
          <p className="text-gray-400 text-sm">No members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members.map((m: any) => (
            <button
              key={m.id}
              onClick={() => onOpenProfile(m.id)}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex flex-col items-center text-center hover:border-brand-blue/30 hover:shadow-blue transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold overflow-hidden mb-2">
                {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : (m.name?.[0] ?? '?')}
              </div>
              <div className="text-sm font-semibold text-gray-900 truncate w-full flex items-center justify-center gap-1">
                {m.name ?? 'Learner'}
                {m.role !== 'STUDENT' && <ShieldCheck size={12} className="text-brand-orange flex-shrink-0" />}
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                <Zap size={10} className="text-brand-orange" /> {m.xpPoints} XP
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
