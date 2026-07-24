'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Send, Image as ImageIcon, Loader2, ShieldCheck, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityApi } from '@/lib/api';
import { useConversations, useThread, useSendMessage, useCommunityFriends } from '@/hooks/use-queries';
import { timeAgo } from '@/lib/utils';

interface MessagesPanelProps {
  activeUserId: string | null;
  activeUserName: string | null;
  onSelectUser: (userId: string | null, name: string | null) => void;
}

export function MessagesPanel({ activeUserId, activeUserName, onSelectUser }: MessagesPanelProps) {
  const { data: session } = useSession();
  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const { data: friends } = useCommunityFriends();
  const { data: messages, isLoading: loadingThread } = useThread(activeUserId);
  const sendMessage = useSendMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const myId = (session?.user as any)?.id;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages?.length]);

  const conversationPartners = conversations ?? [];
  const friendsWithoutConvo = (friends ?? []).filter(
    (f: any) => !conversationPartners.some((c: any) => c.partner.id === f.id),
  );

  const send = (mediaUrl?: string, mediaType?: string) => {
    if (!activeUserId) return;
    if (!text.trim() && !mediaUrl) return;
    sendMessage.mutate(
      { receiverId: activeUserId, content: text.trim() || undefined, mediaUrl, mediaType },
      {
        onSuccess: () => setText(''),
        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Could not send message.'),
      },
    );
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await communityApi.uploadMedia(file);
      send(data.url, data.mediaType);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Thread view ──────────────────────────────────────────────
  if (activeUserId) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <button onClick={() => onSelectUser(null, null)} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </button>
          <span className="font-semibold text-gray-900 text-sm">{activeUserName}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loadingThread ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-xl w-2/3" />)}</div>
          ) : (messages ?? []).length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-10">Say hi 👋 to start the conversation.</p>
          ) : (
            (messages ?? []).map((m: any) => {
              const mine = m.senderId === myId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
                    {m.mediaUrl && (
                      m.mediaType === 'VIDEO'
                        ? <video src={m.mediaUrl} controls className="rounded-lg max-w-full mb-1" />
                        : <img src={m.mediaUrl} alt="" className="rounded-lg max-w-full mb-1" />
                    )}
                    {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                    <div className={`text-[10px] mt-1 ${mine ? 'text-white/60' : 'text-gray-400'}`}>{timeAgo(m.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100">
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-gray-400 hover:text-brand-blue transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            className="flex-1 text-sm px-3 py-2 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <button onClick={() => send()} disabled={sendMessage.isPending} className="bg-brand-blue text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Conversation list ────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {loadingConvos ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : conversationPartners.length === 0 && friendsWithoutConvo.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-card">
          <MessageCircle size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No conversations yet. Add friends and say hello!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversationPartners.map((c: any) => (
            <button
              key={c.partner.id}
              onClick={() => onSelectUser(c.partner.id, c.partner.name)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-card border border-gray-100 p-3 hover:border-brand-blue/30 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {c.partner.image ? <img src={c.partner.image} alt="" className="w-full h-full object-cover" /> : (c.partner.name?.[0] ?? '?')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  {c.partner.name ?? 'Learner'}
                  {c.partner.role !== 'STUDENT' && <ShieldCheck size={12} className="text-brand-orange" />}
                </div>
                <div className="text-xs text-gray-400 truncate">{c.lastMessage}</div>
              </div>
              {c.unreadCount > 0 && (
                <span className="bg-brand-orange text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
          {friendsWithoutConvo.map((f: any) => (
            <button
              key={f.id}
              onClick={() => onSelectUser(f.id, f.name)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl shadow-card border border-gray-100 p-3 hover:border-brand-blue/30 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                {f.image ? <img src={f.image} alt="" className="w-full h-full object-cover" /> : (f.name?.[0] ?? '?')}
              </div>
              <div className="text-sm font-semibold text-gray-900">{f.name ?? 'Learner'}</div>
              <span className="ml-auto text-xs text-gray-300">New</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
