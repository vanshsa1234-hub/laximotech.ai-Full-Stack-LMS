'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Plus, Trash2, RotateCcw, FileText, Mail, Info, ShieldCheck, Brain, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminSiteContent, useUpdateSiteContent, useResetSiteContent } from '@/hooks/use-queries';

const TABS = [
  { key: 'about',        label: 'About Us',        icon: Info },
  { key: 'contact',       label: 'Contact Us',      icon: Mail },
  { key: 'privacy',       label: 'Privacy Policy',  icon: ShieldCheck },
  { key: 'terms',         label: 'Terms of Service',icon: FileText },
  { key: 'career-quiz',   label: 'Career Quiz',     icon: Brain },
  { key: 'faq',           label: 'FAQ',             icon: HelpCircle },
];

const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-brand-orange";
const labelClass = "block text-xs font-semibold text-gray-400 mb-1.5";

export default function AdminSiteContentPage() {
  const [activeTab, setActiveTab] = useState('about');
  const { data: all, isLoading } = useAdminSiteContent();
  const updateContent = useUpdateSiteContent();
  const resetContent  = useResetSiteContent();

  const active = (all as any[])?.find(c => c.key === activeTab);
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => { if (active) setDraft(active.data); }, [active?.key, all]);

  const handleSave = () => {
    updateContent.mutate({ key: activeTab, data: draft }, {
      onSuccess: () => toast.success('Saved! Changes are live immediately.'),
      onError:   () => toast.error('Failed to save.'),
    });
  };

  const handleReset = () => {
    if (!confirm('Reset this page back to the default content? Your edits will be lost.')) return;
    resetContent.mutate(activeTab, { onSuccess: () => toast.success('Reset to default.') });
  };

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl">Site Content</h1>
        <p className="text-gray-500 text-sm mt-1">Edit the copy shown on About, Contact, Privacy, Terms, and the Career Quiz.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === t.key ? 'bg-brand-orange text-white border-brand-orange' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {isLoading || !draft ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>
      ) : (
        <div className="max-w-3xl bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              active?.isCustomized ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-700 text-gray-400'
            }`}>
              {active?.isCustomized ? 'Customized' : 'Using default content'}
            </span>
            {active?.isCustomized && (
              <button onClick={handleReset} disabled={resetContent.isPending}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors">
                <RotateCcw size={12} /> Reset to default
              </button>
            )}
          </div>

          {activeTab === 'about'      && <AboutForm draft={draft} setDraft={setDraft} />}
          {activeTab === 'contact'    && <ContactForm draft={draft} setDraft={setDraft} />}
          {(activeTab === 'privacy' || activeTab === 'terms') && <PolicyForm draft={draft} setDraft={setDraft} />}
          {activeTab === 'career-quiz' && <CareerQuizForm draft={draft} setDraft={setDraft} />}
          {activeTab === 'faq'         && <FaqForm draft={draft} setDraft={setDraft} />}

          <button onClick={handleSave} disabled={updateContent.isPending}
            className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
            {updateContent.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {updateContent.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea = false, rows = 3 }: any) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {textarea ? (
        <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={rows} className={inputClass + ' resize-none'} />
      ) : (
        <input value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

function AboutForm({ draft, setDraft }: any) {
  const set = (k: string, v: any) => setDraft((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-4">
      <Field label="Hero Title" value={draft.heroTitle} onChange={(v: string) => set('heroTitle', v)} />
      <Field label="Hero Subtitle" value={draft.heroSubtitle} onChange={(v: string) => set('heroSubtitle', v)} textarea />
      <Field label="Mission Title" value={draft.missionTitle} onChange={(v: string) => set('missionTitle', v)} />
      <Field label="Mission Text" value={draft.missionText} onChange={(v: string) => set('missionText', v)} textarea rows={4} />
      <Field label="Story Title" value={draft.storyTitle} onChange={(v: string) => set('storyTitle', v)} />
      <Field label="Story Paragraphs (one per line)"
        value={(draft.storyParagraphs ?? []).join('\n')}
        onChange={(v: string) => set('storyParagraphs', v.split('\n').filter(Boolean))}
        textarea rows={5} />
      <Field label="Quote Text" value={draft.quoteText} onChange={(v: string) => set('quoteText', v)} textarea />
      <Field label="Quote Author" value={draft.quoteAuthor} onChange={(v: string) => set('quoteAuthor', v)} />
      <Field label="CTA Title" value={draft.ctaTitle} onChange={(v: string) => set('ctaTitle', v)} />
      <Field label="CTA Subtitle" value={draft.ctaSubtitle} onChange={(v: string) => set('ctaSubtitle', v)} />
    </div>
  );
}

function ContactForm({ draft, setDraft }: any) {
  const set = (k: string, v: any) => setDraft((p: any) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-4">
      <Field label="Support Email" value={draft.email} onChange={(v: string) => set('email', v)} />
      <Field label="Phone" value={draft.phone} onChange={(v: string) => set('phone', v)} />
      <Field label="Location" value={draft.location} onChange={(v: string) => set('location', v)} />
      <Field label="Response Time Note" value={draft.responseTime} onChange={(v: string) => set('responseTime', v)} textarea />
    </div>
  );
}

function PolicyForm({ draft, setDraft }: any) {
  const set = (k: string, v: any) => setDraft((p: any) => ({ ...p, [k]: v }));
  const sections = draft.sections ?? [];

  const updateSection = (i: number, key: 'heading' | 'body', value: string) => {
    const next = [...sections];
    next[i] = { ...next[i], [key]: value };
    set('sections', next);
  };
  const removeSection = (i: number) => set('sections', sections.filter((_: any, idx: number) => idx !== i));
  const addSection = () => set('sections', [...sections, { heading: 'New Section', body: '' }]);

  return (
    <div className="space-y-4">
      <Field label="Last Updated" value={draft.lastUpdated} onChange={(v: string) => set('lastUpdated', v)} />
      <div className="space-y-3">
        <label className={labelClass}>Sections</label>
        {sections.map((s: any, i: number) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 space-y-2 relative">
            <button onClick={() => removeSection(i)} className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-400">
              <Trash2 size={13} />
            </button>
            <input value={s.heading} onChange={e => updateSection(i, 'heading', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-semibold outline-none focus:border-brand-orange pr-8" />
            <textarea value={s.body} onChange={e => updateSection(i, 'body', e.target.value)} rows={3}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:border-brand-orange resize-none" />
          </div>
        ))}
        <button onClick={addSection}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white text-sm py-2.5 rounded-xl hover:border-brand-orange transition-colors">
          <Plus size={14} /> Add Section
        </button>
      </div>
    </div>
  );
}

function FaqForm({ draft, setDraft }: any) {
  const items = draft.items ?? [];

  const updateItem = (i: number, key: 'q' | 'a', value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    setDraft((p: any) => ({ ...p, items: next }));
  };
  const removeItem = (i: number) => setDraft((p: any) => ({ ...p, items: items.filter((_: any, idx: number) => idx !== i) }));
  const addItem = () => setDraft((p: any) => ({ ...p, items: [...items, { q: 'New question', a: '' }] }));

  return (
    <div className="space-y-4">
      <label className={labelClass}>Questions ({items.length})</label>
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-gray-800 rounded-xl p-4 space-y-2 relative">
          <button onClick={() => removeItem(i)} className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-400">
            <Trash2 size={13} />
          </button>
          <input value={item.q} onChange={e => updateItem(i, 'q', e.target.value)}
            placeholder="Question"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-semibold outline-none focus:border-brand-orange pr-8" />
          <textarea value={item.a} onChange={e => updateItem(i, 'a', e.target.value)} rows={3}
            placeholder="Answer"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none focus:border-brand-orange resize-none" />
        </div>
      ))}
      <button onClick={addItem}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white text-sm py-2.5 rounded-xl hover:border-brand-orange transition-colors">
        <Plus size={14} /> Add Question
      </button>
      {items.length === 0 && (
        <p className="text-gray-500 text-xs text-center py-2">No FAQs — the section will be hidden from the homepage until you add at least one.</p>
      )}
    </div>
  );
}

function CareerQuizForm({ draft, setDraft }: any) {
  const set = (k: string, v: any) => setDraft((p: any) => ({ ...p, [k]: v }));
  const [jsonText, setJsonText] = useState(() => JSON.stringify(draft.questions ?? [], null, 2));
  const [jsonError, setJsonError] = useState('');

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      set('questions', parsed);
      setJsonError('');
    } catch {
      setJsonError('Invalid JSON — fix the syntax before saving.');
    }
  };

  return (
    <div className="space-y-4">
      <Field label="Hero Title" value={draft.heroTitle} onChange={(v: string) => set('heroTitle', v)} />
      <Field label="Hero Subtitle" value={draft.heroSubtitle} onChange={(v: string) => set('heroSubtitle', v)} textarea />
      <div>
        <label className={labelClass}>
          Quiz Questions (JSON — each item needs id, question, emoji, options: [{`{label, value}`}])
        </label>
        <textarea value={jsonText} onChange={e => handleJsonChange(e.target.value)} rows={16}
          className={inputClass + ' resize-none font-mono text-xs'} />
        {jsonError && <p className="text-red-400 text-xs mt-1.5">{jsonError}</p>}
      </div>
      <p className="text-gray-500 text-xs">
        Note: the recommendation logic (which career path a combination of answers points to,
        and its salary/duration figures) is not editable here — it's hardcoded in the quiz
        component. Ask me to wire it up to your real Career Paths data in a follow-up pass.
      </p>
    </div>
  );
}
