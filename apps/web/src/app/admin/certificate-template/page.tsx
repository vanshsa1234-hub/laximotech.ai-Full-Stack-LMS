'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, RotateCcw, Award, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminSiteContent, useUpdateSiteContent, useResetSiteContent, useRegenerateCertificates } from '@/hooks/use-queries';
import { ImageUpload } from '@/components/admin/image-upload';

const SAMPLE = {
  holderName: 'Priya Sharma',
  courseTitle: 'AI & Machine Learning — Hindi',
  finalScore: '92%',
  issuedAt: '6 July 2026',
  certificateNo: 'CERT-A1B2C3D4',
};

const FIELD_LABELS: Record<string, string> = {
  holderName: 'Student Name',
  courseTitle: 'Course Title',
  finalScore: 'Score',
  issuedAt: 'Issue Date',
  certificateNo: 'Certificate No.',
};

const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-brand-orange";

function translateForAlign(align: string) {
  if (align === 'left') return '0';
  if (align === 'right') return '-100%';
  return '-50%';
}

export default function CertificateTemplatePage() {
  const { data: all, isLoading } = useAdminSiteContent();
  const updateContent = useUpdateSiteContent();
  const resetContent  = useResetSiteContent();
  const regenerate    = useRegenerateCertificates();

  const entry = (all as any[])?.find(c => c.key === 'certificate-template');
  const [draft, setDraft] = useState<any>(null);

  useEffect(() => { if (entry) setDraft(entry.data); }, [entry?.key, all]);

  const setField = (fieldKey: string, prop: string, value: any) => {
    setDraft((p: any) => ({
      ...p,
      fields: { ...p.fields, [fieldKey]: { ...p.fields[fieldKey], [prop]: value } },
    }));
  };

  const handleSave = () => {
    updateContent.mutate({ key: 'certificate-template', data: draft }, {
      onSuccess: () => toast.success('Saved! New certificates will use this design.'),
      onError:   () => toast.error('Failed to save.'),
    });
  };

  const handleReset = () => {
    if (!confirm('Reset to the built-in default certificate design? Your custom layout will be lost.')) return;
    resetContent.mutate('certificate-template', { onSuccess: () => toast.success('Reset to default design.') });
  };

  const handleRegenerate = () => {
    if (!confirm('Re-render every already-issued certificate with this design? This may take a moment.')) return;
    regenerate.mutate(undefined, {
      onSuccess: (res: any) => toast.success(`Updated ${res.succeeded}/${res.total} certificates with the new design.`),
      onError:   () => toast.error('Failed to regenerate certificates.'),
    });
  };

  if (isLoading || !draft) {
    return <div className="flex justify-center py-20"><Loader2 size={28} className="text-brand-orange animate-spin" /></div>;
  }

  return (
    <div className="p-6 min-h-screen bg-gray-950">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-white text-2xl flex items-center gap-2">
          <Award size={22} className="text-brand-orange" /> Certificate Design
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload your own certificate background and position where the student's name, course, and other details appear.
          Leave the background empty to keep using the built-in default design.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5 h-fit">
          <ImageUpload
            label="Certificate Background"
            value={draft.backgroundImageUrl}
            onChange={url => setDraft((p: any) => ({ ...p, backgroundImageUrl: url }))}
            folder="certificate-bg"
            aspectClassName="aspect-[297/210]"
            helpText="Recommended: 2970×2100px (A4 landscape), so text stays sharp in the PDF."
          />

          {draft.backgroundImageUrl && (
            <div className="space-y-4 pt-2">
              <p className="text-xs font-semibold text-gray-400">Field Positions (X/Y as % of the certificate)</p>
              {Object.entries(draft.fields).map(([key, f]: [string, any]) => (
                <div key={key} className="bg-gray-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-semibold">{FIELD_LABELS[key] ?? key}</span>
                    {key === 'finalScore' && (
                      <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={f.show !== false} onChange={e => setField(key, 'show', e.target.checked)} />
                        Show on certificate
                      </label>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">X %</label>
                      <input type="number" min={0} max={100} value={f.x} onChange={e => setField(key, 'x', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Y %</label>
                      <input type="number" min={0} max={100} value={f.y} onChange={e => setField(key, 'y', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Size (px)</label>
                      <input type="number" min={6} max={80} value={f.fontSize} onChange={e => setField(key, 'fontSize', Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Color</label>
                      <input type="color" value={f.color} onChange={e => setField(key, 'color', e.target.value)} className="w-full h-7 bg-gray-900 border border-gray-700 rounded-lg cursor-pointer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Align</label>
                      <select value={f.textAlign} onChange={e => setField(key, 'textAlign', e.target.value)} className={inputClass}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-1">Weight</label>
                      <select value={f.fontWeight} onChange={e => setField(key, 'fontWeight', e.target.value)} className={inputClass}>
                        <option value="400">Normal</option>
                        <option value="600">Semibold</option>
                        <option value="700">Bold</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={updateContent.isPending}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
              {updateContent.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {updateContent.isPending ? 'Saving...' : 'Save Design'}
            </button>
            {entry?.isCustomized && (
              <button onClick={handleReset} disabled={resetContent.isPending}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3">
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          <div className="pt-1">
            <button onClick={handleRegenerate} disabled={regenerate.isPending}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white font-semibold py-2.5 rounded-xl text-xs hover:border-brand-orange transition-colors disabled:opacity-60">
              {regenerate.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {regenerate.isPending ? 'Regenerating...' : 'Apply Design to Existing Certificates'}
            </button>
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              A certificate's PDF is only generated once, when it's first issued. After saving a new
              design, use this to re-render every certificate students already earned — otherwise
              they'll keep the design that was live when they were issued.
            </p>
          </div>
        </div>

        {/* Live preview — mirrors exactly what the real PDF generator renders */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 h-fit">
          <p className="text-xs font-semibold text-gray-400 mb-3">Live Preview (sample data)</p>
          {draft.backgroundImageUrl ? (
            <div className="relative w-full aspect-[297/210] rounded-lg overflow-hidden border border-gray-700"
              style={{ backgroundImage: `url(${draft.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {Object.entries(draft.fields).map(([key, f]: [string, any]) => {
                if (f.show === false) return null;
                return (
                  <div key={key} style={{
                    position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
                    transform: `translate(${translateForAlign(f.textAlign)}, -50%)`,
                    fontSize: `${f.fontSize * 0.45}px`, // scaled down to fit the on-screen preview box
                    color: f.color, fontWeight: f.fontWeight, fontFamily: f.fontFamily,
                    textAlign: f.textAlign as any, whiteSpace: 'nowrap',
                  }}>
                    {(SAMPLE as any)[key]}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="aspect-[297/210] rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center px-6">Upload a background image to see the live preview and position controls.</p>
            </div>
          )}
          <p className="text-gray-500 text-xs mt-3">
            This preview is scaled for screen display — the real PDF renders at full A4 landscape resolution using the same X/Y positions.
          </p>
        </div>
      </div>
    </div>
  );
}