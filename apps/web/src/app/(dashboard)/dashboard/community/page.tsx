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
    <main className="min-h-screen bg-brand-ice pt-4 pb-24 md:pb-4 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex flex-col h-[calc(100vh-6.5rem)] md:h-[calc(100vh-3rem)]">
        {/* Icon-only tab switcher — press an icon to reveal that section;
            the active tab expands to show its label, others stay compact
            so the section below gets as much room as possible. */}
        <div className="flex gap-1 bg-white dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-card p-1 mb-3 w-fit mx-auto flex-shrink-0">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== 'messages') { setActiveChatId(null); setActiveChatName(null); } }}
              title={t.label}
              className={`relative flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all ${
                tab === t.id ? 'bg-brand-blue text-white px-4' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/70 px-2.5'
              }`}
            >
              <t.icon size={16} />
              {tab === t.id && <span>{t.label}</span>}
              {t.id === 'requests' && incomingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {incomingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          {tab === 'feed' && <CommunityFeed onOpenProfile={setProfileUserId} />}
          {tab === 'members' && (
            <div className="h-full overflow-y-auto">
              <CommunityMembers onOpenProfile={setProfileUserId} />
            </div>
          )}
          {tab === 'requests' && (
            <div className="h-full overflow-y-auto">
              <FriendRequestsPanel onOpenProfile={setProfileUserId} />
            </div>
          )}
          {tab === 'messages' && (
            <MessagesPanel
              activeUserId={activeChatId}
              activeUserName={activeChatName}
              onSelectUser={(id, name) => { setActiveChatId(id); setActiveChatName(name); }}
            />
          )}
        </div>
      </div>

      <UserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} onMessage={openChatFromProfile} />
    </main>
  );
}
