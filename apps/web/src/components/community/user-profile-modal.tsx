'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, BookOpen, Trophy, Zap, UserPlus, Clock, Check, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useCommunityProfile, useSendFriendRequest } from '@/hooks/use-queries';

interface UserProfileModalProps {
  userId: string | null;
  onClose: () => void;
  onMessage?: (userId: string, name: string) => void;
}

export function UserProfileModal({ userId, onClose, onMessage }: UserProfileModalProps) {
  const { data: profile, isLoading } = useCommunityProfile(userId);
  const { data: session } = useSession();
  const sendRequest = useSendFriendRequest();
  const canMessageDirectly = profile?.role === 'ADMIN' || (session?.user as any)?.role === 'ADMIN';

  const handleSendRequest = () => {
    if (!userId) return;
    sendRequest.mutate(userId, {
      onSuccess: () => toast.success('Friend request sent!'),
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Could not send request.'),
    });
  };

  return (
    <AnimatePresence>
      {userId && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-card border border-gray-100 w-full max-w-sm overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-brand-blue to-purple-700 h-20">
              <button onClick={onClose} className="absolute top-3 right-3 text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {isLoading || !profile ? (
              <div className="p-6 space-y-3">
                <div className="skeleton h-16 w-16 rounded-full -mt-14 mx-auto" />
                <div className="skeleton h-4 w-1/2 mx-auto rounded" />
                <div className="skeleton h-20 w-full rounded-xl" />
              </div>
            ) : (
              <div className="px-6 pb-6">
                <div className="w-16 h-16 rounded-full bg-brand-blue -mt-8 border-4 border-white flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                  {profile.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : (profile.name?.[0] ?? '?')}
                </div>

                <h3 className="font-heading font-bold text-gray-900 text-lg mt-2">{profile.name}</h3>
                {profile.role !== 'STUDENT' && (
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full mt-1">
                    {profile.role}
                  </span>
                )}
                {profile.bio && <p className="text-sm text-gray-500 mt-2">{profile.bio}</p>}

                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <BookOpen size={16} className="mx-auto text-brand-blue mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{profile.enrolledCourses}</div>
                    <div className="text-[10px] text-gray-400">Courses</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <Award size={16} className="mx-auto text-brand-orange mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{profile.certificates}</div>
                    <div className="text-[10px] text-gray-400">Certs</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <Trophy size={16} className="mx-auto text-yellow-500 mb-1" />
                    <div className="font-bold text-gray-900 text-sm">#{profile.rank}</div>
                    <div className="text-[10px] text-gray-400">Rank</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <Zap size={16} className="mx-auto text-purple-600 mb-1" />
                    <div className="font-bold text-gray-900 text-sm">{profile.avgProgress}%</div>
                    <div className="text-[10px] text-gray-400">Progress</div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  {profile.friendStatus === 'SELF' ? null : (profile.friendStatus === 'FRIENDS' || canMessageDirectly) ? (
                    <button
                      onClick={() => onMessage?.(profile.id, profile.name ?? 'Friend')}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-blue text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle size={16} /> Message
                    </button>
                  ) : profile.friendStatus === 'REQUEST_SENT' ? (
                    <button disabled className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-400 text-sm font-semibold py-2.5 rounded-xl cursor-not-allowed">
                      <Clock size={16} /> Request sent
                    </button>
                  ) : profile.friendStatus === 'REQUEST_RECEIVED' ? (
                    <div className="flex-1 text-center text-sm text-gray-400 py-2.5">Check your Friend Requests tab</div>
                  ) : (
                    <button
                      onClick={handleSendRequest}
                      disabled={sendRequest.isPending}
                      className="flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {sendRequest.isPending ? <Check size={16} className="animate-pulse" /> : <UserPlus size={16} />}
                      Add friend
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
