'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, ToggleRight, ToggleLeft, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminCoupons, useCreateCoupon, useToggleCoupon } from '@/hooks/use-queries';
import { formatDate } from '@/lib/utils';

export default function AdminCouponsPage() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const createCoupon = useCreateCoupon();
  const toggleCoupon = useToggleCoupon();

  const [creating, setCreating] = useState(false);
  const [form,     setForm]     = useState({ code: '', discountPct: 20, maxUses: '', expiresAt: '' });

  const list = (coupons as any[]) ?? [];

  const toggle = (c: any) => {
    toggleCoupon.mutate({ id: c.id, isActive: !c.isActive }, {
      onSuccess: () => toast.success('Coupon updated!'),
      onError:   () => toast.error('Failed to update coupon.'),
    });
  };

  const create = async () => {
    if (!form.code.trim() || !form.discountPct) { toast.error('Code and discount required'); return; }
    try {
      await createCoupon.mutateAsync({
        code: form.code.toUpperCase(),
        discountPct: Number(form.discountPct),
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setForm({ code: '', discountPct: 20, maxUses: '', expiresAt: '' });
      setCreating(false);
      toast.success('Coupon created!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create coupon. Code may already exist.');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{list.filter(c => c.isActive).length} active coupons</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-orange-light transition-colors text-sm">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-white mb-4">New Coupon</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Code *</label>
              <input value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))}
                placeholder="e.g. SALE30" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Discount % *</label>
              <input type="number" min={1} max={100} value={form.discountPct} onChange={e => setForm(p => ({...p, discountPct: Number(e.target.value)}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max Uses (optional)</label>
              <input type="number" value={form.maxUses} onChange={e => setForm(p => ({...p, maxUses: e.target.value}))}
                placeholder="Unlimited" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Expires (optional)</label>
              <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({...p, expiresAt: e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={create} disabled={createCoupon.isPending}
              className="bg-brand-orange text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
              {createCoupon.isPending ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => setCreating(false)} className="bg-gray-700 text-gray-300 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-gray-600 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No coupons yet. Create your first one.</div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['Code', 'Discount', 'Used / Max', 'Expires', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-brand-orange" />
                      <span className="font-mono font-bold text-white text-sm">{c.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied!'); }}
                        className="text-gray-600 hover:text-gray-400 transition-colors">
                        <Copy size={11} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-brand-green font-bold text-sm">{c.discountPct}% off</span>
                  </td>
                  <td className="px-5 py-4 text-gray-300 text-sm">
                    {c._count?.orders ?? c.usedCount ?? 0} / {c.maxUses ?? '∞'}
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggle(c)} disabled={toggleCoupon.isPending}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                        c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                      {c.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      {c.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggle(c)} disabled={toggleCoupon.isPending}
                      className="text-xs text-gray-500 hover:text-white transition-colors">
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
