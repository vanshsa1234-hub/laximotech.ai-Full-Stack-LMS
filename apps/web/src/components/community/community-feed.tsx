'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, X, Send, Trash2, ShieldCheck, Loader2, Globe2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityApi } from '@/lib/api';
import { useCommunityFeed, useCreatePost, useDeletePost } from '@/hooks/use-queries';
import { timeAgo } from '@/lib/utils';
import { MediaLightbox } from './media-lightbox';

export function CommunityFeed({ onOpenProfile }: { onOpenProfile: (userId: string) => void }) {
  const { data: session } = useSession();
  const { data, isLoading } = useCommunityFeed();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; type: string } | null>(null);

  // Newest posts arrive last from the API's desc order — reversed here so
  // the feed flows like a chat: oldest at top, newest at the bottom.
  const posts = [...(data?.posts ?? [])].reverse();
  const myId = (session?.user as any)?.id;
  const myRole = (session?.user as any)?.role;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [posts.length]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video.');
      return;
    }
    setUploading(true);
    try {
      const { data } = await communityApi.uploadMedia(file);
      setMedia({ url: data.url, type: data.mediaType });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePost = () => {
    if (!content.trim() && !media) { toast.error('Write something or attach media first.'); return; }
    createPost.mutate(
      { content: content.trim() || undefined, mediaUrl: media?.url, mediaType: media?.type },
      {
        onSuccess: () => { setContent(''); setMedia(null); },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Could not post.'),
      },
    );
  };

  return (
    <div className="w-full bg-white dark:bg-gray-900/60 rounded-2xl shadow-card border border-gray-100 dark:border-gray-700/60 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 flex-shrink-0">
        <Globe2 size={16} className="text-brand-blue" />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Community Feed</span>
      </div>

      {/* Scrollable message area — flows oldest → newest, top → bottom.
          Your own posts align right (like WhatsApp); everyone else's align left. */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-10">No posts yet — be the first to share something!</p>
        ) : (
          posts.map((post: any) => {
            const mine = post.author.id === myId;
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''}`}
              >
                <button onClick={() => onOpenProfile(post.author.id)} className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {post.author.image ? <img src={post.author.image} alt="" className="w-full h-full object-cover" /> : (post.author.name?.[0] ?? '?')}
                  </div>
                </button>

                <div className={`min-w-0 flex-1 flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <button onClick={() => onOpenProfile(post.author.id)} className={`flex items-center gap-1 text-left ${mine ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{mine ? 'You' : (post.author.name ?? 'Learner')}</span>
                    {post.author.role !== 'STUDENT' && <ShieldCheck size={12} className="text-brand-orange" />}
                  </button>

                  <div className={`inline-block mt-1 rounded-2xl px-3 py-2 max-w-[85%] sm:max-w-md ${
                    mine ? 'bg-brand-blue text-white rounded-tr-sm' : 'bg-gray-50 dark:bg-gray-800/70 rounded-tl-sm'
                  }`}>
                    {post.content && (
                      <p className={`text-sm whitespace-pre-wrap ${mine ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{post.content}</p>
                    )}
                    {post.mediaUrl && (
                      <button
                        onClick={() => setLightbox({ url: post.mediaUrl, type: post.mediaType })}
                        className={`${post.content ? 'mt-2' : ''} block cursor-zoom-in`}
                      >
                        {post.mediaType === 'VIDEO' ? (
                          <video src={post.mediaUrl} className="rounded-xl max-w-[240px] max-h-[320px] w-auto h-auto pointer-events-none" />
                        ) : (
                          <img src={post.mediaUrl} alt="" className="rounded-xl max-w-[240px] max-h-[320px] w-auto h-auto object-cover" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className={`flex items-center gap-1 mt-1 ${mine ? 'flex-row-reverse' : ''}`}>
                    {(post.author.id === myId || myRole === 'ADMIN') && (
                      <button onClick={() => deletePost.mutate(post.id)} className="text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Media preview — pops up above the input bar before posting */}
      {media && (
        <div className="px-4 pt-3 flex-shrink-0">
          <div className="relative inline-block rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/60 mx-auto">
            <button onClick={() => setMedia(null)} className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-1 z-10">
              <X size={13} />
            </button>
            {media.type === 'VIDEO'
              ? <video src={media.url} controls className="max-w-[200px] max-h-[220px] w-auto h-auto" />
              : <img src={media.url} alt="" className="max-w-[200px] max-h-[220px] w-auto h-auto object-cover" />}
          </div>
        </div>
      )}

      {/* Composer bar — fixed to the bottom of the section; attach button stays stuck on the left */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 flex-shrink-0">
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 text-gray-400 dark:text-gray-500 hover:text-brand-blue transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={19} className="animate-spin" /> : <ImageIcon size={19} />}
        </button>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
          placeholder="Share something with the community..."
          className="flex-1 min-w-0 text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/70 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
        <button
          onClick={handlePost}
          disabled={createPost.isPending || uploading}
          className="flex-shrink-0 bg-brand-blue text-white p-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>

      <MediaLightbox media={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}