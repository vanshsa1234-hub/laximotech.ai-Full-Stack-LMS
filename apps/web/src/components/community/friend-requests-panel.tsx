'use client';

import { Check, X, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFriendRequests, useRespondFriendRequest } from '@/hooks/use-queries';

export function FriendRequestsPanel({ onOpenProfile }: { onOpenProfile: (userId: string) => void }) {
  const { data, isLoading } = useFriendRequests();
  const respond = useRespondFriendRequest();

  const incoming = data?.incoming ?? [];
  const outgoing = data?.outgoing ?? [];

  const handleRespond = (id: string, accept: boolean) => {
    respond.mutate({ id, accept }, {
      onSuccess: () => toast.success(accept ? 'Friend request accepted!' : 'Request declined.'),
    });
  };

  if (isLoading) return <div className="space-y-3 max-w-2xl mx-auto">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Incoming requests</h3>
        {incoming.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-card">
            <Users size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No incoming friend requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incoming.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-3 flex items-center justify-between">
                <button onClick={() => onOpenProfile(r.sender.id)} className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold overflow-hidden">
                    {r.sender.image ? <img src={r.sender.image} alt="" className="w-full h-full object-cover" /> : (r.sender.name?.[0] ?? '?')}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{r.sender.name ?? 'Learner'}</span>
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(r.id, true)} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={() => handleRespond(r.id, false)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-heading font-bold text-gray-900 text-sm mb-3">Sent requests</h3>
        {outgoing.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">You haven't sent any requests.</p>
        ) : (
          <div className="space-y-2">
            {outgoing.map((r: any) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-card border border-gray-100 p-3 flex items-center justify-between">
                <button onClick={() => onOpenProfile(r.receiver.id)} className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold overflow-hidden">
                    {r.receiver.image ? <img src={r.receiver.image} alt="" className="w-full h-full object-cover" /> : (r.receiver.name?.[0] ?? '?')}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{r.receiver.name ?? 'Learner'}</span>
                </button>
                <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={12} /> Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
