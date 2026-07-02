'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Zap, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersApi } from '@/lib/api';

declare global {
  interface Window { Razorpay: any; }
}

interface EnrollButtonProps {
  courseId:    string;
  courseSlug:  string;
  price:       number;
  courseTitle: string;
  className?:  string;
}

export function EnrollButton({ courseId, courseSlug, price, courseTitle, className = '' }: EnrollButtonProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const isAuthenticated = Boolean(session?.user?.id || session?.user?.email || session?.user?.name);

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async () => {
    if (status === 'loading') return;

    if (!isAuthenticated) {
      toast('Please log in to enroll', { icon: '🔐' });
      signIn(undefined, { callbackUrl: window.location.href });
      return;
    }

    setLoading(true);
    try {
      const { data } = await ordersApi.create(courseId);
      const firstLessonId = data?.firstLessonId ?? data?.course?.firstLessonId ?? null;

      // ── Honest path: payments aren't configured, real enrollment happened directly ──
      if (data.freeEnrollment) {
        toast.success('🎉 Enrolled! (Payments not yet configured — direct access granted)');
        window.location.href = firstLessonId ? `/learn/${courseSlug}/${firstLessonId}` : `/courses/${courseSlug}`;
        return;
      }

      // ── Real Razorpay flow (only runs once keys are configured) ──
      const loaded = await loadRazorpay();
      if (!loaded) { toast.error('Payment gateway failed to load. Please try again.'); setLoading(false); return; }

      const { order } = data;
      const options = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount:      order.amount,
        currency:    'INR',
        name:        'laximotech.ai',
        description: courseTitle,
        order_id:    order.razorpayOrderId,
        prefill: { name: session?.user?.name ?? '', email: session?.user?.email ?? '' },
        theme: { color: '#1F4E79' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await ordersApi.verify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('🎉 Enrollment successful!');
            window.location.href = firstLessonId ? `/learn/${courseSlug}/${firstLessonId}` : `/courses/${courseSlug}`;
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed. Please try again.'); setLoading(false); });
      rzp.open();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        toast.success('You are already enrolled in this course!');
        window.location.href = `/courses/${courseSlug}`;
      } else {
        toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Something went wrong. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleEnroll}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-heading font-bold py-4 px-6 rounded-full shadow-orange hover:shadow-orange-lg hover:bg-brand-orange-light transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <><Loader2 size={18} className="animate-spin" /> Processing...</>
      ) : (
        <><Zap size={18} className="fill-white" /> Enroll Now — Rs {price}</>
      )}
    </motion.button>
  );
}
