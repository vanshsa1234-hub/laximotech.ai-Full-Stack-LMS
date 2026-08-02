'use client';

import { Play, Pause, ChevronLeft, ChevronRight, X, ListRestart } from 'lucide-react';
import type { AlgoStepBase } from './use-algorithm-player';

interface AlgorithmPseudocodePanelProps {
  title: string;
  pseudocode: string[];
  step: AlgoStepBase;
  stepIdx: number;
  total: number;
  playing: boolean;
  isLast: boolean;
  accentColor: string;
  errorColor: string;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onFinishNow: () => void;
  onCancel: () => void;
}

export function AlgorithmPseudocodePanel({
  title, pseudocode, step, stepIdx, total, playing, isLast, accentColor, errorColor,
  onPrev, onNext, onTogglePlay, onFinishNow, onCancel,
}: AlgorithmPseudocodePanelProps) {
  return (
    <div className="rounded-xl border p-4 mb-2" style={{ borderColor: `${accentColor}33`, background: 'rgba(0,0,0,0.4)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono text-gray-500">
          Step {stepIdx + 1} / {total} — {title}
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={onPrev} disabled={stepIdx === 0}
            className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-300 disabled:opacity-30">
            <ChevronLeft size={14} />
          </button>
          <button onClick={onTogglePlay} className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-300">
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={isLast ? onFinishNow : onNext} className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-300">
            <ChevronRight size={14} />
          </button>
          {isLast && !step.error && (
            <button onClick={onFinishNow} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: `${accentColor}22`, color: accentColor }}>
              <ListRestart size={12} /> Done
            </button>
          )}
          <button onClick={onCancel} className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-400 hover:text-red-400">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="font-mono text-xs space-y-0.5 mb-3">
        {pseudocode.map((line, i) => (
          <div
            key={i}
            className="px-2 py-0.5 rounded transition-colors"
            style={i === step.pseudoLine
              ? { background: `${accentColor}22`, color: accentColor, fontWeight: 700 }
              : { color: '#6b7280' }}
          >
            {line}
          </div>
        ))}
      </div>

      <p className="text-gray-300 text-xs">{step.note}</p>
      {step.error && (
        <p className="text-xs mt-2 font-semibold" style={{ color: errorColor }}>⚠ {step.error}</p>
      )}
    </div>
  );
}