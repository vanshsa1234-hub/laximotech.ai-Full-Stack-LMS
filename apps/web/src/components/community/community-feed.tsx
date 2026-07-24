'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, X, Send, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityApi } from '@/lib/api';
import { useCommunityFeed, useCreatePost, useDeletePost } from '@/hooks/use-queries';
import { timeAgo } from '@/lib/utils';

export function CommunityFeed({ onOpenProfile }: { onOpenProfile: (userId: string) => void }) {
  const { data: session } = useSession();
  const { data, isLoading } = useCommunityFeed();
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const posts = data?.posts ?? [];
  const myId = (session?.user as any)?.id;
  const myRole = (session?.user as any)?.role;

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
    <div className="max-w-2xl mx-auto">
      {/* Composer */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-4 mb-5">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with the community..."
          rows={2}
          className="w-full resize-none text-sm text-gray-800 focus:outline-none placeholder:text-gray-400"
        />

        {media && (
          <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-100 max-h-64">
            <button onClick={() => setMedia(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 z-10">
              <X size={14} />
            </button>
            {media.type === 'VIDEO'
              ? <video src={media.url} controls className="w-full max-h-64 object-cover" />
              : <img src={media.url} alt="" className="w-full max-h-64 object-cover" />}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-brand-blue px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageIcon size={15} />} Photo/Video
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={createPost.isPending || uploading}
            className="flex items-center gap-1.5 bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={14} /> Post
          </button>
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-card">
          <p className="text-gray-400 text-sm">No posts yet — be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-card border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <button onClick={() => onOpenProfile(post.author.id)} className="flex items-center gap-2.5 text-left">
                  <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                    {post.author.image ? <img src={post.author.image} alt="" className="w-full h-full object-cover" /> : (post.author.name?.[0] ?? '?')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      {post.author.name ?? 'Learner'}
                      {post.author.role !== 'STUDENT' && <ShieldCheck size={12} className="text-brand-orange" />}
                    </div>
                    <div className="text-[11px] text-gray-400">{timeAgo(post.createdAt)}</div>
                  </div>
                </button>
                {(post.author.id === myId || myRole === 'ADMIN') && (
                  <button onClick={() => deletePost.mutate(post.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {post.content && <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{post.content}</p>}

              {post.mediaUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                  {post.mediaType === 'VIDEO'
                    ? <video src={post.mediaUrl} controls className="w-full max-h-96 object-cover" />
                    : <img src={post.mediaUrl} alt="" className="w-full max-h-96 object-cover" />}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
