'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Zap, Loader2, Tag, X, CheckCircle2 } from 'lucide-react';
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

  // ── Coupon code — optional, applied before checkout ──────────────────
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; discountPct: number; discountAmount: number; finalAmount: number;
  } | null>(null);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setValidatingCoupon(true);
    try {
      const { data } = await ordersApi.validateCoupon(courseId, code);
      if (data.valid) {
        setAppliedCoupon({ code: code.toUpperCase(), discountPct: data.discountPct, discountAmount: data.discountAmount, finalAmount: data.finalAmount });
        toast.success(data.message ?? `${data.discountPct}% off applied!`);
      } else {
        setAppliedCoupon(null);
        toast.error(data.message ?? 'Invalid or expired coupon.');
      }
    } catch {
      setAppliedCoupon(null);
      toast.error('Could not validate that coupon. Please try again.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

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
      const { data } = await ordersApi.create(courseId, appliedCoupon?.code);
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

  const displayPrice = appliedCoupon ? appliedCoupon.finalAmount : price;

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleEnroll}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-heading font-bold py-4 px-6 rounded-full shadow-orange hover:shadow-orange-lg hover:bg-brand-orange-light transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <><Loader2 size={18} className="animate-spin" /> Processing...</>
        ) : appliedCoupon ? (
          <>
            <Zap size={18} className="fill-white" /> Enroll Now —{' '}
            <span className="line-through opacity-60 mr-1">Rs {price}</span> Rs {displayPrice}
          </>
        ) : (
          <><Zap size={18} className="fill-white" /> Enroll Now — Rs {price}</>
        )}
      </motion.button>

      {/* Coupon code */}
      <div className="mt-3">
        {appliedCoupon ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm">
            <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
            <span className="text-green-700 flex-1">
              <strong className="font-mono">{appliedCoupon.code}</strong> applied — {appliedCoupon.discountPct}% off
            </span>
            <button onClick={removeCoupon} className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0">
              <X size={15} />
            </button>
          </div>
        ) : showCouponInput ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                placeholder="Coupon code"
                disabled={validatingCoupon}
                className="input pl-9 h-10 text-sm font-mono disabled:opacity-60"
              />
            </div>
            <button onClick={applyCoupon} disabled={!couponInput.trim() || validatingCoupon}
              className="flex-shrink-0 bg-gray-900 text-white text-sm font-semibold px-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {validatingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
            </button>
          </div>
        ) : (
          <button onClick={() => setShowCouponInput(true)}
            className="text-sm text-gray-500 hover:text-brand-orange transition-colors underline underline-offset-2">
            Have a coupon code?
          </button>
        )}
      </div>
    </div>
  );
}