'use client';

import { useState } from 'react';
import { Users2, Newspaper, UserPlus2, MessageCircle } from 'lucide-react';
import { CommunityFeed } from '@/components/community/community-feed';
import { CommunityMembers } from '@/components/community/community-members';
import { FriendRequestsPanel } from '@/components/community/friend-requests-panel';
import { MessagesPanel } from '@/components/community/messages-panel';
import { UserProfileModal } from '@/components/community/user-profile-modal';
import { useFriendRequests } from '@/hooks/use-queries';

type Tab = 'feed' | 'members' | 'requests' | 'messages';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'feed',     label: 'Feed',      icon: Newspaper },
  { id: 'members',  label: 'Members',   icon: Users2 },
  { id: 'requests', label: 'Requests',  icon: UserPlus2 },
  { id: 'messages', label: 'Messages',  icon: MessageCircle },
];

export default function CommunityPage() {
  const [tab, setTab] = useState<Tab>('feed');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState<string | null>(null);

  const { data: requests } = useFriendRequests();
  const incomingCount = requests?.incoming?.length ?? 0;

  const openChatFromProfile = (userId: string, name: string) => {
    setProfileUserId(null);
    setActiveChatId(userId);
    setActiveChatName(name);
    setTab('messages');
  };

  return (
    <main className="min-h-screen bg-brand-ice pt-6 pb-24 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading font-bold text-gray-900 text-2xl mb-1">Community</h1>
        <p className="text-gray-500 text-sm mb-6">Connect with fellow learners, share your wins, and make friends.</p>

        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-card p-1 mb-6 max-w-md">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== 'messages') { setActiveChatId(null); setActiveChatName(null); } }}
              className={`relative flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-colors ${
                tab === t.id ? 'bg-brand-blue text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <t.icon size={14} /> {t.label}
              {t.id === 'requests' && incomingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {incomingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'feed' && <CommunityFeed onOpenProfile={setProfileUserId} />}
        {tab === 'members' && <CommunityMembers onOpenProfile={setProfileUserId} />}
        {tab === 'requests' && <FriendRequestsPanel onOpenProfile={setProfileUserId} />}
        {tab === 'messages' && (
          <MessagesPanel
            activeUserId={activeChatId}
            activeUserName={activeChatName}
            onSelectUser={(id, name) => { setActiveChatId(id); setActiveChatName(name); }}
          />
        )}
      </div>

      <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} onMessage={openChatFromProfile} />
    </main>
  );
}
