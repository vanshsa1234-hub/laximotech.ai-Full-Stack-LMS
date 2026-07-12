'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, RotateCcw, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ImageUpload } from '@/components/admin/image-upload';

export const SAMPLE = {
  holderName:    'Priya Sharma',
  courseTitle:   'AI & Machine Learning — Hindi',
  finalScore:    '92%',
  issuedAt:      '6 July 2026',
  certificateNo: 'CERT-A1B2C3D4',
};

const FIELD_LABELS: Record<string, string> = {
  holderName:    'Student Name',
  courseTitle:   'Course Title',
  finalScore:    'Score',
  issuedAt:      'Issue Date',
  certificateNo: 'Certificate No.',
};

// Curated font choices. Georgia/Arial are web-safe (render anywhere, no
// loading needed). Everything else is a Google Font — the PDF generator
// automatically imports whichever of these are actually used and waits for
// them to load before printing, so a script font always renders correctly
// instead of silently falling back to a system default.
export const FONT_OPTIONS = [
  { label: 'Georgia (serif)',        value: 'Georgia, serif' },
  { label: 'Arial (sans-serif)',     value: 'Arial, sans-serif' },
  { label: 'Playfair Display',       value: "'Playfair Display', serif" },
  { label: 'Poppins',                value: "'Poppins', sans-serif" },
  { label: 'Montserrat',             value: "'Montserrat', sans-serif" },
  { label: 'Dancing Script (script)',value: "'Dancing Script', cursive" },
  { label: 'Great Vibes (script)',   value: "'Great Vibes', cursive" },
  { label: 'Pacifico (script)',      value: "'Pacifico', cursive" },
];

const inputClass = "w-full bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none focus:border-brand-orange";

function translateForAlign(align: string) {
  if (align === 'left') return '0';
  if (align === 'right') return '-100%';
  return '-50%';
}

interface Props {
  data: any;                              // current template { backgroundImageUrl, fields }
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
  onReset?: () => void;                   // omit to hide the Reset button
  resetting?: boolean;
  showReset?: boolean;
  onRegenerate?: () => void;              // omit to hide "apply to existing certificates"
  regenerating?: boolean;
  regenerateLabel?: string;
  regenerateNote?: string;
}

export function CertificateTemplateEditor({
  data, onChange, onSave, saving,
  onReset, resetting, showReset,
  onRegenerate, regenerating, regenerateLabel, regenerateNote,
}: Props) {
  const [bgStatus, setBgStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');

  // Actively test the background image the same way the PDF generator will
  // need to load it, so a broken/unreachable URL is caught right here in the
  // design page — instead of only surfacing later as a certificate with no
  // background photo.
  useEffect(() => {
    const url = data?.backgroundImageUrl;
    if (!url) { setBgStatus('idle'); return; }
    setBgStatus('checking');
    const img = new Image();
    img.onload  = () => setBgStatus('ok');
    img.onerror = () => setBgStatus('error');
    img.src = url;
    return () => { img.onload = null; img.onerror = null; };
  }, [data?.backgroundImageUrl]);

  const setField = (fieldKey: string, prop: string, value: any) => {
    onChange({
      ...data,
      fields: { ...data.fields, [fieldKey]: { ...data.fields[fieldKey], [prop]: value } },
    });
  };

  const handleSave = () => {
    if (bgStatus === 'error') {
      const proceed = confirm(
        "This background image failed to load — certificates saved now will download with NO background photo. " +
        "Save anyway?"
      );
      if (!proceed) return;
    }
    onSave();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Controls */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-5 h-fit">
        <ImageUpload
          label="Certificate Background"
          value={data.backgroundImageUrl}
          onChange={url => onChange({ ...data, backgroundImageUrl: url })}
          folder="certificate-bg"
          aspectClassName="aspect-[297/210]"
          helpText="Recommended: 2970×2100px (A4 landscape), so text stays sharp in the PDF."
        />

        {bgStatus === 'checking' && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Loader2 size={13} className="animate-spin" /> Checking background image...
          </div>
        )}
        {bgStatus === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2.5">
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 text-xs font-semibold">This background image failed to load.</p>
              <p className="text-red-300/70 text-[11px] mt-1 leading-relaxed">
                Certificates generated with this design will have no background photo. This usually
                means the API server isn't running, the file was deleted, or the saved URL points
                somewhere unreachable. Try re-uploading the image.
              </p>
            </div>
          </div>
        )}
        {bgStatus === 'ok' && (
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <CheckCircle2 size={13} /> Background image loads correctly.
          </div>
        )}

        {data.backgroundImageUrl && (
          <div className="space-y-4 pt-2">
            <p className="text-xs font-semibold text-gray-400">Field Positions (X/Y as % of the certificate)</p>
            {Object.entries(data.fields).map(([key, f]: [string, any]) => (
              <div key={key} className="bg-gray-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-semibold">{FIELD_LABELS[key] ?? key}</span>
                  <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={f.show !== false} onChange={e => setField(key, 'show', e.target.checked)} />
                    Show on certificate
                  </label>
                </div>
                {f.show === false && (
                  <p className="text-[11px] text-amber-400/80 -mt-1">Hidden — won't appear on the certificate.</p>
                )}
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
                <div className="grid grid-cols-3 gap-2">
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
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Font</label>
                    <select value={f.fontFamily} onChange={e => setField(key, 'fontFamily', e.target.value)} className={inputClass}>
                      {FONT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white font-semibold py-3 rounded-xl text-sm hover:bg-brand-orange-light transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Design'}
          </button>
          {showReset && onReset && (
            <button onClick={onReset} disabled={resetting}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-3">
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>

        {onRegenerate && (
          <div className="pt-1">
            <button onClick={onRegenerate} disabled={regenerating}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 border border-gray-700 text-white font-semibold py-2.5 rounded-xl text-xs hover:border-brand-orange transition-colors disabled:opacity-60">
              {regenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {regenerating ? 'Regenerating...' : (regenerateLabel ?? 'Apply Design to Existing Certificates')}
            </button>
            {regenerateNote && <p className="text-[11px] text-gray-500 mt-2 text-center">{regenerateNote}</p>}
          </div>
        )}
      </div>

      {/* Live preview — mirrors exactly what the real PDF generator renders.
          Sticky + self-start so it stays visible in the viewport while the
          left column (which can get tall with many field editors open)
          scrolls past it, instead of scrolling away together. */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 h-fit sticky top-6 self-start">
        <p className="text-xs font-semibold text-gray-400 mb-3">Live Preview (sample data)</p>
        {data.backgroundImageUrl && bgStatus !== 'error' ? (
          <div className="relative w-full aspect-[297/210] rounded-lg overflow-hidden border border-gray-700"
            style={{ backgroundImage: `url(${data.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {Object.entries(data.fields).map(([key, f]: [string, any]) => {
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
        ) : data.backgroundImageUrl && bgStatus === 'error' ? (
          <div className="aspect-[297/210] rounded-lg border-2 border-dashed border-red-500/40 bg-red-500/5 flex flex-col items-center justify-center gap-2">
            <AlertTriangle size={22} className="text-red-400" />
            <p className="text-red-400 text-sm text-center px-6 font-semibold">Background image broken</p>
            <p className="text-gray-500 text-xs text-center px-6">Certificates will render without it until this is fixed.</p>
          </div>
        ) : (
          <div className="aspect-[297/210] rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
            <p className="text-gray-500 text-sm text-center px-6">Upload a background image to see the live preview and position controls.</p>
          </div>
        )}
        <p className="text-gray-500 text-xs mt-3">
          This preview is scaled for screen display — the real PDF renders at full A4 landscape resolution using the same X/Y positions, and loads the actual font shown here.
        </p>
      </div>
    </div>
  );
}
