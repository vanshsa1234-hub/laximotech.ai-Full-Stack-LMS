'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { Plus, Trash2, RotateCcw, Play, Pause, ChevronLeft, ChevronRight, X, ListRestart } from 'lucide-react';
import { NEON, gridBackgroundStyle } from './dsa-theme';
import { NeonCube } from './three/neon-cube';
import { ConnectorLine } from './three/connector-line';
import {
  INSERT_PSEUDOCODE, DELETE_PSEUDOCODE, buildInsertSteps, buildDeleteSteps, type LLStep,
} from './linked-list-algorithm';

const SceneShell = dynamic(() => import('./three/scene-shell').then(m => m.SceneShell), { ssr: false });

interface ListNode {
  id: number;
  value: number;
}

const COLOR = NEON.LINKED_LIST;
const CURRENT_COLOR = '#FFC93C'; // amber — the algorithm's `current` pointer
const DELETE_COLOR = '#FF3B5C';  // red — node marked for removal
const PHANTOM_COLOR = '#B6FF6B'; // lime — the in-progress new node
const SPACING = 2.1;

const xForIndex = (i: number, total: number) => i * SPACING - ((total - 1) * SPACING) / 2;

type Mode = 'INSERT' | 'DELETE' | null;

const IconButton = ({ onClick, disabled, label, icon }: {
  onClick: () => void; disabled?: boolean; label: string; icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{ borderColor: `${COLOR}55` }}
    className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-black/60 border hover:bg-black/40 text-gray-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.boxShadow = `0 0 12px ${COLOR}66`; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
  >
    {icon}
    {label}
  </button>
);

export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<ListNode[]>([
    { id: 1, value: 4 }, { id: 2, value: 9 }, { id: 3, value: 2 },
  ]);
  const nextId = useRef(4);

  const [indexInput, setIndexInput] = useState('1');
  const [valueInput, setValueInput] = useState('');

  const [mode, setMode] = useState<Mode>(null);
  const [steps, setSteps] = useState<LLStep[] | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [traverseIdx, setTraverseIdx] = useState<number | null>(null);

  const step = steps ? steps[stepIdx] : null;
  const isLastStep = steps ? stepIdx === steps.length - 1 : false;
  const pseudocode = mode === 'DELETE' ? DELETE_PSEUDOCODE : INSERT_PSEUDOCODE;

  // Auto-play: advance one step at a time on a timer while `playing` is on.
  useEffect(() => {
    if (!playing || !steps) return;
    if (isLastStep) {
      const t = setTimeout(() => finishWalkthrough(), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIdx(i => i + 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, stepIdx, steps]);

  const finishWalkthrough = () => {
    if (steps) {
      const last = steps[steps.length - 1];
      if (last.commit) applyCommit(last.commit, Number(valueInput) || 0);
    }
    setSteps(null);
    setPlaying(false);
    setMode(null);
    setStepIdx(0);
  };

  const applyCommit = (commit: NonNullable<LLStep['commit']>, value: number) => {
    setNodes(prev => {
      if (commit.type === 'INSERT_AT_HEAD') {
        return [{ id: nextId.current++, value }, ...prev];
      }
      if (commit.type === 'INSERT_AFTER') {
        const copy = [...prev];
        copy.splice(commit.at + 1, 0, { id: nextId.current++, value });
        return copy;
      }
      if (commit.type === 'DELETE_AT_HEAD') {
        return prev.slice(1);
      }
      if (commit.type === 'DELETE_AFTER') {
        return prev.filter((_, i) => i !== commit.at);
      }
      return prev;
    });
  };

  const runInsert = () => {
    const index = parseInt(indexInput, 10);
    const value = parseInt(valueInput, 10);
    if (Number.isNaN(index) || index < 0) { toast.error('Enter a valid index (0 or greater).'); return; }
    if (Number.isNaN(value)) { toast.error('Enter a value to insert.'); return; }
    setMode('INSERT');
    setSteps(buildInsertSteps(nodes.length, index, value));
    setStepIdx(0);
    setPlaying(true);
  };

  const runDelete = () => {
    const index = parseInt(indexInput, 10);
    if (Number.isNaN(index) || index < 0) { toast.error('Enter a valid index (0 or greater).'); return; }
    setMode('DELETE');
    setSteps(buildDeleteSteps(nodes.length, index));
    setStepIdx(0);
    setPlaying(true);
  };

  const cancelWalkthrough = () => {
    setSteps(null);
    setPlaying(false);
    setMode(null);
    setStepIdx(0);
  };

  const traverse = async () => {
    if (steps || traverseIdx !== null || nodes.length === 0) return;
    for (let i = 0; i < nodes.length; i++) {
      setTraverseIdx(i);
      await new Promise(r => setTimeout(r, 450));
    }
    setTraverseIdx(null);
  };

  const clear = () => { setNodes([]); cancelWalkthrough(); };

  const busy = steps !== null;

  // ── 3D positions for the current committed list + any in-progress phantom node ──
  const phantomPosition = (): [number, number, number] => {
    if (!step) return [0, 1.7, 0];
    const total = nodes.length;
    if (step.current === null) {
      const headX = total > 0 ? xForIndex(0, total) : 0;
      return [headX, 1.7, 0];
    }
    const curX = xForIndex(step.current, total);
    const nextX = step.current + 1 < total ? xForIndex(step.current + 1, total) : curX + SPACING;
    return [(curX + nextX) / 2, 1.7, 0];
  };

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col" style={gridBackgroundStyle}>
      <div className="max-w-4xl mx-auto w-full p-6 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-1" style={{ color: COLOR, textShadow: `0 0 10px ${COLOR}88` }}>
          Singly Linked List — Algorithm Walkthrough
        </h3>
        <p className="text-gray-400 text-xs mb-5">
          Every insert/delete plays out the real algorithm step by step — watch <span style={{ color: CURRENT_COLOR }}>current</span> traverse
          the list and the pointers rewire live. Drag the scene to orbit.
        </p>

        {/* Operation inputs */}
        <div className="flex flex-wrap items-end gap-2 mb-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-gray-500">index</span>
            <input
              type="number" value={indexInput} onChange={e => setIndexInput(e.target.value)} disabled={busy}
              className="w-20 text-sm px-2.5 py-1.5 rounded-lg bg-black/60 border text-gray-100 disabled:opacity-40"
              style={{ borderColor: `${COLOR}55` }}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-gray-500">value (for insert)</span>
            <input
              type="number" value={valueInput} onChange={e => setValueInput(e.target.value)} disabled={busy}
              placeholder="e.g. 42"
              className="w-28 text-sm px-2.5 py-1.5 rounded-lg bg-black/60 border text-gray-100 placeholder:text-gray-600 disabled:opacity-40"
              style={{ borderColor: `${COLOR}55` }}
            />
          </label>
          <IconButton onClick={runInsert} disabled={busy} icon={<Plus size={13} />} label="Insert at index" />
          <IconButton onClick={runDelete} disabled={busy || nodes.length === 0} icon={<Trash2 size={13} />} label="Delete at index" />
          <IconButton onClick={traverse} disabled={busy || traverseIdx !== null || nodes.length === 0} icon={<Play size={13} />} label="Traverse" />
          <IconButton onClick={clear} disabled={nodes.length === 0} icon={<RotateCcw size={13} />} label="Clear" />
        </div>

        {/* Playback controls + pseudocode panel, shown only during a walkthrough */}
        {steps && step && (
          <div className="rounded-xl border p-4 mb-2" style={{ borderColor: `${COLOR}33`, background: 'rgba(0,0,0,0.4)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-gray-500">
                Step {stepIdx + 1} / {steps.length} — {mode === 'DELETE' ? 'Delete at Index' : 'Insert at Index'}
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setPlaying(false); setStepIdx(i => Math.max(0, i - 1)); }} disabled={stepIdx === 0}
                  className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-300 disabled:opacity-30">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPlaying(p => !p)}
                  className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-300">
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={() => { if (isLastStep) finishWalkthrough(); else { setPlaying(false); setStepIdx(i => Math.min(steps.length - 1, i + 1)); } }}
                  className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-300">
                  <ChevronRight size={14} />
                </button>
                {isLastStep && !step.error && (
                  <button onClick={finishWalkthrough} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: `${COLOR}22`, color: COLOR }}>
                    <ListRestart size={12} /> Done
                  </button>
                )}
                <button onClick={cancelWalkthrough} className="p-1.5 rounded-lg bg-black/60 border border-gray-700 text-gray-400 hover:text-red-400">
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
                    ? { background: `${COLOR}22`, color: COLOR, fontWeight: 700 }
                    : { color: '#6b7280' }}
                >
                  {line}
                </div>
              ))}
            </div>

            <p className="text-gray-300 text-xs">{step.note}</p>
            {step.error && (
              <p className="text-xs mt-2 font-semibold" style={{ color: DELETE_COLOR }}>⚠ {step.error}</p>
            )}
          </div>
        )}
      </div>

      <div className="relative flex-1 min-h-[380px]">
        {nodes.length === 0 && !steps && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-gray-600 text-sm font-mono">head → null</span>
          </div>
        )}
        <SceneShell accent={mode ? (step?.error ? DELETE_COLOR : CURRENT_COLOR) : COLOR}>
          {nodes.map((n, i) => {
            const isCurrent = step?.current === i;
            const isMarkedDelete = step?.markDelete === i;
            const isTraversing = traverseIdx === i;
            const color = isMarkedDelete ? DELETE_COLOR : (isCurrent || isTraversing) ? CURRENT_COLOR : COLOR;
            return (
              <NeonCube
                key={n.id}
                position={[xForIndex(i, nodes.length), 0, 0]}
                color={color}
                label={n.value}
                active={isCurrent || isMarkedDelete || isTraversing}
                floatPhase={i * 0.7}
              />
            );
          })}
          {nodes.slice(0, -1).map((n, i) => (
            <ConnectorLine
              key={`edge-${n.id}`}
              from={[xForIndex(i, nodes.length) + 0.65, 0, 0]}
              to={[xForIndex(i + 1, nodes.length) - 0.65, 0, 0]}
              color={COLOR}
              active={step?.current === i || step?.current === i + 1}
            />
          ))}
          {step?.phantomValue !== undefined && (
            <>
              <NeonCube position={phantomPosition()} color={PHANTOM_COLOR} label={step.phantomValue} active size={[1.05, 1.05, 1.05]} floatPhase={9} />
              {step.phantomLinkTo !== undefined && step.phantomLinkTo !== null && (
                <ConnectorLine from={phantomPosition()} to={[xForIndex(step.phantomLinkTo, nodes.length), 0, 0]} color={PHANTOM_COLOR} active />
              )}
            </>
          )}
        </SceneShell>
      </div>

      <p className="text-gray-500 text-xs p-6 pt-4 flex-shrink-0 max-w-4xl mx-auto w-full">
        <span style={{ color: CURRENT_COLOR }}>Amber</span> = the <code className="text-gray-400">current</code> pointer · {' '}
        <span style={{ color: PHANTOM_COLOR }}>Lime</span> = the new node being built · {' '}
        <span style={{ color: DELETE_COLOR }}>Red</span> = marked for removal.
      </p>
    </div>
  );
}