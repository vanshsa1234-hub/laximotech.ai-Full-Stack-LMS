'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, User, Mail, Phone, MapPin, Linkedin, Edit, Trash2, X, Save, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useAdminInstructors, useCreateInstructor, useUpdateInstructor, useDeleteInstructor,
} from '@/hooks/use-queries';

const emptyForm = { name: '', email: '', bio: '', phone: '', city: '', linkedinUrl: '', image: '' };

export default function AdminInstructorsPage() {
  const { data: instructors, isLoading } = useAdminInstructors();
  const createInstructor = useCreateInstructor();
  const updateInstructor = useUpdateInstructor();
  const deleteInstructor = useDeleteInstructor();

  const [creating, setCreating]   = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const list = (instructors as any[]) ?? [];

  const startCreate = () => { setForm(emptyForm); setCreating(true); setEditingId(null); };
  const startEdit = (ins: any) => {
    setForm({
      name: ins.name ?? '', email: ins.email ?? '', bio: ins.bio ?? '',
      phone: ins.phone ?? '', city: ins.city ?? '', linkedinUrl: ins.linkedinUrl ?? '', image: ins.image ?? '',
    });
    setEditingId(ins.id);
    setCreating(false);
  };
  const cancel = () => { setCreating(false); setEditingId(null); setForm(emptyForm); };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error('Name and email are required.'); return; }
    try {
      await createInstructor.mutateAsync(form);
      toast.success('Instructor added! They can now be assigned to courses.');
      cancel();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create instructor.');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await updateInstructor.mutateAsync({ id: editingId, data: {
        name: form.name, bio: form.bio, phone: form.phone, city: form.city,
        linkedinUrl: form.linkedinUrl, image: form.image,
      }});
      toast.success('Instructor profile updated!');
      cancel();
    } catch {
      toast.error('Failed to update instructor.');
    }
  };

  const handleDelete = (ins: any) => {
    if (!confirm(`Remove ${ins.name} as an instructor?`)) return;
    deleteInstructor.mutate(ins.id, {
      onSuccess: () => toast.success('Instructor removed.'),
      onError:   (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to remove instructor.'),
    });
  };

  const formOpen = creating || !!editingId;

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Instructors</h1>
          <p className="text-gray-500 text-sm mt-1">{list.length} {list.length === 1 ? 'instructor' : 'instructors'} · real profiles shown on course pages</p>
        </div>
        <button onClick={startCreate}
          className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-brand-orange-light transition-colors">
          <Plus size={16} /> Add Instructor
        </button>
      </div>

      {formOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">{editingId ? 'Edit Instructor Profile' : 'New Instructor'}</h3>
            <button onClick={cancel} className="text-gray-500 hover:text-white"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email * {editingId && <span className="text-gray-600">(cannot be changed)</span>}</label>
              <input value={form.email} disabled={!!editingId} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange disabled:opacity-50" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Bio (shown on course pages)</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={3}
                placeholder="Real teaching background, experience, specialties..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">City</label>
              <input value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">LinkedIn URL</label>
              <input value={form.linkedinUrl} onChange={e => setForm(p => ({...p, linkedinUrl: e.target.value}))}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Photo URL</label>
              <input value={form.image} onChange={e => setForm(p => ({...p, image: e.target.value}))}
                placeholder="https://..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-orange" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={editingId ? handleUpdate : handleCreate}
              disabled={createInstructor.isPending || updateInstructor.isPending}
              className="flex items-center gap-2 bg-brand-orange text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
              {(createInstructor.isPending || updateInstructor.isPending) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {editingId ? 'Save Changes' : 'Create Instructor'}
            </button>
            <button onClick={cancel} className="bg-gray-700 text-gray-300 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-gray-600 transition-colors">Cancel</button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No instructors yet. Add your first one.</div>
      ) : (
        <div className="grid gap-4">
          {list.map((ins, i) => (
            <motion.div key={ins.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 p-5 flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {ins.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ins.image} alt={ins.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={22} className="text-brand-orange" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{ins.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    ins.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-brand-blue/10 text-brand-blue'
                  }`}>{ins.role}</span>
                </div>
                {ins.bio && <p className="text-gray-400 text-xs mt-1 line-clamp-2">{ins.bio}</p>}
                <div className="flex flex-wrap items-center gap-3 text-gray-500 text-xs mt-2">
                  <span className="flex items-center gap-1"><Mail size={11} /> {ins.email}</span>
                  {ins.phone && <span className="flex items-center gap-1"><Phone size={11} /> {ins.phone}</span>}
                  {ins.city && <span className="flex items-center gap-1"><MapPin size={11} /> {ins.city}</span>}
                  {ins.linkedinUrl && <a href={ins.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-brand-blue hover:text-brand-orange"><Linkedin size={11} /> LinkedIn</a>}
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {ins._count?.coursesCrated ?? 0} courses</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => startEdit(ins)} className="p-2 text-gray-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(ins)} disabled={deleteInstructor.isPending}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
