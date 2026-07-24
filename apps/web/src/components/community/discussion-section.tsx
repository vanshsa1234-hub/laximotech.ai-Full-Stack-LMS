// C:\Users\LENOVO\Downloads\laximotech(project)\laximotech7\apps\web\src\components\community\discussion-section.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { ThumbsUp, Reply, Trash2, ChevronDown, ChevronUp, Send, MessageSquare, Loader2 } from 'lucide-react';
import { commentsApi } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Comment {
  id:        string;
  body:      string;
  createdAt: string;
  upvotes:   number;
  user:      { id: string; name: string; image: string | null; role: string };
  votes:     { isUpvote: boolean }[];
  _count:    { replies: number };
  replies?:  Comment[];
}

function CommentItem({ comment, lessonId, onPosted }: { comment: Comment; lessonId: string; onPosted: () => void }) {
  const { data: session } = useSession();
  const [showReplies, setShowReplies] = useState(false);
  const [replies,     setReplies]     = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyOpen,   setReplyOpen]   = useState(false);
  const [replyText,   setReplyText]   = useState('');
  const [upvotes,     setUpvotes]     = useState(comment.upvotes ?? comment.votes?.filter(v => v.isUpvote).length ?? 0);
  const [voted,       setVoted]       = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const isInstructor = comment.user.role === 'INSTRUCTOR' || comment.user.role === 'ADMIN';

  const handleVote = async () => {
    if (!session) { toast.error('Please log in to vote'); return; }
    const newVoted = !voted;
    setVoted(newVoted);
    setUpvotes(u => newVoted ? u + 1 : u - 1);
    try {
      await commentsApi.vote(comment.id, newVoted);
    } catch {
      setVoted(!newVoted);
      setUpvotes(u => newVoted ? u - 1 : u + 1);
      toast.error('Vote failed');
    }
  };

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    try {
      const res = await commentsApi.replies(comment.id);
      setReplies(res.data);
      setShowReplies(true);
    } catch {
      toast.error('Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !session) return;
    setSubmitting(true);
    try {
      await commentsApi.post({ lessonId, body: replyText, parentId: comment.id });
      setReplyText('');
      setReplyOpen(false);
      toast.success('Reply posted!');
      onPosted();
      // Refresh replies if open
      if (showReplies) {
        const res = await commentsApi.replies(comment.id);
        setReplies(res.data);
      }
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex gap-3 py-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden ${isInstructor ? 'bg-brand-orange text-white' : 'bg-brand-blue/10 text-brand-blue'}`}>
          {comment.user.image
            ? <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
            : (comment.user.name?.[0] ?? 'U')}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{comment.user.name}</span>
            {isInstructor && (
              <span className="text-[10px] font-bold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">INSTRUCTOR</span>
            )}
            <span className="text-gray-400 text-xs">{timeAgo(comment.createdAt)}</span>
          </div>

          <p className="text-gray-700 text-sm leading-relaxed mb-3">{comment.body}</p>

          <div className="flex items-center gap-4 text-xs">
            <button onClick={handleVote}
              className={`flex items-center gap-1.5 transition-colors ${voted ? 'text-brand-orange' : 'text-gray-400 hover:text-brand-orange'}`}>
              <ThumbsUp size={13} className={voted ? 'fill-brand-orange' : ''} />
              <span className="font-semibold">{upvotes}</span>
            </button>

            {session && (
              <button onClick={() => setReplyOpen(p => !p)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-brand-blue transition-colors">
                <Reply size={13} /> Reply
              </button>
            )}
          </div>

          <AnimatePresence>
            {replyOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2">
                <input value={replyText} onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReply()}
                  placeholder="Write a reply..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20" />
                <button onClick={handleReply} disabled={submitting || !replyText.trim()}
                  className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center disabled:opacity-50 flex-shrink-0">
                  {submitting ? <Loader2 size={13} className="text-white animate-spin" /> : <Send size={13} className="text-white" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {comment._count?.replies > 0 && (
            <button onClick={loadReplies}
              className="mt-2 flex items-center gap-1 text-xs text-brand-blue hover:text-brand-orange transition-colors font-semibold">
              {loadingReplies ? <Loader2 size={12} className="animate-spin" /> : showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showReplies ? 'Hide' : 'Show'} {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReplies && replies.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ml-8 pl-4 border-l-2 border-gray-100">
            {replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} lessonId={lessonId} onPosted={onPosted} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DiscussionSection({ lessonId }: { lessonId: string }) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments,   setComments]   = useState<Comment[]>([]);
  const [loading,    setLoading]    = useState(true);

  const fetchComments = async () => {
    try {
      const res = await commentsApi.lessonComments(lessonId);
      setComments(res.data);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [lessonId]);

  const handlePost = async () => {
    if (!session) { toast.error('Please log in to comment'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.post({ lessonId, body: newComment });
      setNewComment('');
      toast.success('Comment posted!');
      fetchComments();
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
        <MessageSquare size={18} className="text-brand-blue" />
        <h3 className="font-heading font-semibold text-gray-900">Discussion ({comments.length})</h3>
      </div>

      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
            {session?.user?.image
              ? <img src={session.user.image} alt="" className="w-full h-full object-cover" />
              : (session?.user?.name?.[0] ?? '?')}
          </div>
          <div className="flex-1">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
              rows={3} placeholder={session ? 'Type your question or comment...' : 'Log in to participate in discussion'}
              disabled={!session}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 resize-none disabled:opacity-50 disabled:cursor-not-allowed" />
            <div className="flex justify-end mt-2">
              <button onClick={handlePost} disabled={submitting || !newComment.trim() || !session}
                className="flex items-center gap-2 bg-brand-blue text-white font-semibold text-sm px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-blue-light transition-colors">
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <><Send size={13} /> Post</>}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No comments yet. Be the first to ask a question!</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {comments.map(c => <CommentItem key={c.id} comment={c} lessonId={lessonId} onPosted={fetchComments} />)}
          </div>
        )}
      </div>
    </div>
  );
}
