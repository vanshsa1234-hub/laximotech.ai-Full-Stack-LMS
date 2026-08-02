'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { Plus, Trash2, RotateCcw, Play, Repeat, GitCommitHorizontal, Zap } from 'lucide-react';
import { NEON, gridBackgroundStyle } from './dsa-theme';
import { NeonCube } from './three/neon-cube';
import { ConnectorLine } from './three/connector-line';
import { useAlgorithmPlayer } from './use-algorithm-player';
import { AlgorithmPseudocodePanel } from './algorithm-pseudocode-panel';
import {
  INSERT_PSEUDOCODE, DELETE_PSEUDOCODE, REVERSE_PSEUDOCODE, FIND_MIDDLE_PSEUDOCODE, DETECT_CYCLE_PSEUDOCODE,
  buildInsertSteps, buildDeleteSteps, buildReverseSteps, buildFindMiddleSteps, buildDetectCycleSteps,
  type LLStep,
} from './linked-list-algorithm';

const SceneShell = dynamic(() => import('./three/scene-shell').then(m => m.SceneShell), { ssr: false });

interface ListNode {
  id: number;
  value: number;
}

const COLOR = NEON.LINKED_LIST;
const CURRENT_COLOR = '#FFC93C'; // amber — `current` / `slow` pointer
const FAST_COLOR = '#FF2E9A';    // magenta — `fast` pointer
const DELETE_COLOR = '#FF3B5C';  // red — node marked for removal / error
const DONE_COLOR = '#B6FF6B';    // lime — phantom node / already-reversed section / meeting point
const SPACING = 2.1;

const xForIndex = (i: number, total: number) => i * SPACING - ((total - 1) * SPACING) / 2;

type Mode = 'INSERT' | 'DELETE' | 'REVERSE' | 'FIND_MIDDLE' | 'DETECT_CYCLE' | null;

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

const PSEUDOCODE_BY_MODE: Record<Exclude<Mode, null>, string[]> = {
  INSERT: INSERT_PSEUDOCODE,
  DELETE: DELETE_PSEUDOCODE,
  REVERSE: REVERSE_PSEUDOCODE,
  FIND_MIDDLE: FIND_MIDDLE_PSEUDOCODE,
  DETECT_CYCLE: DETECT_CYCLE_PSEUDOCODE,
};

const TITLE_BY_MODE: Record<Exclude<Mode, null>, string> = {
  INSERT: 'Insert at Index',
  DELETE: 'Delete at Index',
  REVERSE: 'Reverse List',
  FIND_MIDDLE: 'Find Middle (slow/fast)',
  DETECT_CYCLE: "Detect Cycle (Floyd's)",
};

export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<ListNode[]>([
    { id: 1, value: 4 }, { id: 2, value: 9 }, { id: 3, value: 2 },
  ]);
  const nextId = useRef(4);

  const [indexInput, setIndexInput] = useState('1');
  const [valueInput, setValueInput] = useState('');
  const [cycleTargetInput, setCycleTargetInput] = useState('');

  const [mode, setMode] = useState<Mode>(null);
  const [steps, setSteps] = useState<LLStep[] | null>(null);
  const [traverseIdx, setTraverseIdx] = useState<number | null>(null);

  const applyCommit = (commit: NonNullable<LLStep['commit']>) => {
    const value = Number(valueInput) || 0;
    setNodes(prev => {
      switch (commit.type) {
        case 'INSERT_AT_HEAD':
          return [{ id: nextId.current++, value }, ...prev];
        case 'INSERT_AFTER': {
          const copy = [...prev];
          copy.splice((commit.at ?? -1) + 1, 0, { id: nextId.current++, value });
          return copy;
        }
        case 'DELETE_AT_HEAD':
          return prev.slice(1);
        case 'DELETE_AFTER':
          return prev.filter((_, i) => i !== commit.at);
        case 'REVERSE':
          return [...prev].reverse();
        default:
          return prev;
      }
    });
    if (commit.type === 'FIND_MIDDLE') {
      const middle = nodes[commit.at ?? -1];
      toast.success(middle ? `Middle node: index ${commit.at}, value ${middle.value}.` : 'Middle found.');
    }
    if (commit.type === 'CYCLE_FOUND') toast.error(`Cycle detected — slow and fast met at index ${commit.at}.`);
    if (commit.type === 'NO_CYCLE') toast.success('No cycle in this list.');
  };

  const { step, stepIdx, total, isLast, playing, togglePlay, next, prev, finishNow } = useAlgorithmPlayer<LLStep>(
    steps,
    (lastStep) => {
      if (lastStep.commit) applyCommit(lastStep.commit);
      setSteps(null);
      setMode(null);
    },
  );

  const cancelWalkthrough = () => { setSteps(null); setMode(null); };
  const busy = steps !== null;

  const runInsert = () => {
    const index = parseInt(indexInput, 10);
    const value = parseInt(valueInput, 10);
    if (Number.isNaN(index) || index < 0) { toast.error('Enter a valid index (0 or greater).'); return; }
    if (Number.isNaN(value)) { toast.error('Enter a value to insert.'); return; }
    setMode('INSERT');
    setSteps(buildInsertSteps(nodes.length, index, value));
  };

  const runDelete = () => {
    const index = parseInt(indexInput, 10);
    if (Number.isNaN(index) || index < 0) { toast.error('Enter a valid index (0 or greater).'); return; }
    setMode('DELETE');
    setSteps(buildDeleteSteps(nodes.length, index));
  };

  const runReverse = () => {
    if (nodes.length === 0) { toast.error('The list is empty.'); return; }
    setMode('REVERSE');
    setSteps(buildReverseSteps(nodes.length));
  };

  const runFindMiddle = () => {
    if (nodes.length === 0) { toast.error('The list is empty.'); return; }
    setMode('FIND_MIDDLE');
    setSteps(buildFindMiddleSteps(nodes.length));
  };

  const runDetectCycle = () => {
    if (nodes.length === 0) { toast.error('The list is empty.'); return; }
    const trimmed = cycleTargetInput.trim();
    const target = trimmed === '' ? null : parseInt(trimmed, 10);
    if (target !== null && (Number.isNaN(target) || target < 0 || target >= nodes.length)) {
      toast.error(`Cycle target must be between 0 and ${nodes.length - 1} (or blank for no cycle).`);
      return;
    }
    setMode('DETECT_CYCLE');
    setSteps(buildDetectCycleSteps(nodes.length, target));
  };

  const traverse = async () => {
    if (busy || traverseIdx !== null || nodes.length === 0) return;
    for (let i = 0; i < nodes.length; i++) {
      setTraverseIdx(i);
      await new Promise(r => setTimeout(r, 450));
    }
    setTraverseIdx(null);
  };

  const clear = () => { setNodes([]); cancelWalkthrough(); };

  // ── 3D positions for the current committed list + any in-progress phantom node ──
  const phantomPosition = (): [number, number, number] => {
    if (!step) return [0, 1.7, 0];
    const total2 = nodes.length;
    if (step.current === null || step.current === undefined) {
      const headX = total2 > 0 ? xForIndex(0, total2) : 0;
      return [headX, 1.7, 0];
    }
    const curX = xForIndex(step.current, total2);
    const nextX = step.current + 1 < total2 ? xForIndex(step.current + 1, total2) : curX + SPACING;
    return [(curX + nextX) / 2, 1.7, 0];
  };

  const nodeColorFor = (i: number): string => {
    if (!step) return COLOR;
    if (step.markDelete === i) return DELETE_COLOR;
    if (mode === 'FIND_MIDDLE' || mode === 'DETECT_CYCLE') {
      const isSlow = step.slow === i;
      const isFast = step.fast === i;
      if (isSlow && isFast) return DONE_COLOR;
      if (isSlow) return CURRENT_COLOR;
      if (isFast) return FAST_COLOR;
      return COLOR;
    }
    if (mode === 'REVERSE') {
      if (step.current === i) return CURRENT_COLOR;
      if (step.reversedUpto !== undefined && step.reversedUpto !== null && i <= step.reversedUpto) return DONE_COLOR;
      return COLOR;
    }
    if (traverseIdx === i) return CURRENT_COLOR;
    if (step.current === i) return CURRENT_COLOR;
    return COLOR;
  };

  const nodeActiveFor = (i: number): boolean =>
    step ? (step.markDelete === i || step.current === i || step.slow === i || step.fast === i) : traverseIdx === i;

  // Edges: default mode draws the plain forward chain; REVERSE mode derives
  // edges from the algorithm's own pointer state so rewiring is visible live.
  type Edge = { from: number; to: number; color: string; active: boolean };
  const computeEdges = (): Edge[] => {
    const n = nodes.length;
    if (mode === 'REVERSE' && step) {
      const edges: Edge[] = [];
      const doneUpTo = step.reversedUpto ?? null;
      if (doneUpTo !== null) {
        for (let i = 1; i <= doneUpTo; i++) edges.push({ from: i, to: i - 1, color: DONE_COLOR, active: false });
      }
      const cur = step.current;
      let skip: number | null = null;
      if (cur !== null && cur !== undefined && step.rewireNext !== undefined) {
        skip = cur;
        if (step.rewireNext !== null) edges.push({ from: cur, to: step.rewireNext, color: CURRENT_COLOR, active: true });
      }
      const start = (cur ?? doneUpTo ?? -1) + 1;
      for (let i = start; i < n - 1; i++) {
        if (i === skip) continue;
        edges.push({ from: i, to: i + 1, color: COLOR, active: false });
      }
      return edges;
    }
    // default forward chain
    const edges: Edge[] = [];
    for (let i = 0; i < n - 1; i++) {
      edges.push({ from: i, to: i + 1, color: COLOR, active: step?.current === i || step?.current === i + 1 });
    }
    return edges;
  };

  const accent = mode ? (step?.error ? DELETE_COLOR : CURRENT_COLOR) : COLOR;

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col" style={gridBackgroundStyle}>
      <div className="max-w-4xl mx-auto w-full p-6 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-1" style={{ color: COLOR, textShadow: `0 0 10px ${COLOR}88` }}>
          Singly Linked List — Algorithm Walkthrough
        </h3>
        <p className="text-gray-400 text-xs mb-5">
          Every operation plays out the real algorithm step by step — <span style={{ color: CURRENT_COLOR }}>amber</span> is{' '}
          <code className="text-gray-400">current</code>/<code className="text-gray-400">slow</code>,{' '}
          <span style={{ color: FAST_COLOR }}>magenta</span> is <code className="text-gray-400">fast</code>. Drag the scene to orbit.
        </p>

        {/* Insert / Delete */}
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
        </div>

        {/* Technique presets */}
        <div className="flex flex-wrap items-end gap-2 mb-3 pt-3 border-t border-gray-800/60">
          <IconButton onClick={runReverse} disabled={busy || nodes.length === 0} icon={<Repeat size={13} />} label="Reverse list" />
          <IconButton onClick={runFindMiddle} disabled={busy || nodes.length === 0} icon={<GitCommitHorizontal size={13} />} label="Find middle (slow/fast)" />
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-gray-500">cycle back to index (optional)</span>
            <input
              type="number" value={cycleTargetInput} onChange={e => setCycleTargetInput(e.target.value)} disabled={busy}
              placeholder="blank = no cycle"
              className="w-40 text-sm px-2.5 py-1.5 rounded-lg bg-black/60 border text-gray-100 placeholder:text-gray-600 disabled:opacity-40"
              style={{ borderColor: `${FAST_COLOR}55` }}
            />
          </label>
          <IconButton onClick={runDetectCycle} disabled={busy || nodes.length === 0} icon={<Zap size={13} />} label="Detect cycle (Floyd's)" />
          <IconButton onClick={traverse} disabled={busy || traverseIdx !== null || nodes.length === 0} icon={<Play size={13} />} label="Traverse" />
          <IconButton onClick={clear} disabled={nodes.length === 0} icon={<RotateCcw size={13} />} label="Clear" />
        </div>

        {steps && step && mode && (
          <AlgorithmPseudocodePanel
            title={TITLE_BY_MODE[mode]}
            pseudocode={PSEUDOCODE_BY_MODE[mode]}
            step={step}
            stepIdx={stepIdx}
            total={total}
            playing={playing}
            isLast={isLast}
            accentColor={CURRENT_COLOR}
            errorColor={DELETE_COLOR}
            onPrev={prev}
            onNext={next}
            onTogglePlay={togglePlay}
            onFinishNow={finishNow}
            onCancel={cancelWalkthrough}
          />
        )}
      </div>

      <div className="relative flex-1 min-h-[380px]">
        {nodes.length === 0 && !steps && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-gray-600 text-sm font-mono">head → null</span>
          </div>
        )}
        <SceneShell accent={accent}>
          {nodes.map((n, i) => (
            <NeonCube
              key={n.id}
              position={[xForIndex(i, nodes.length), 0, 0]}
              color={nodeColorFor(i)}
              label={n.value}
              active={nodeActiveFor(i)}
              floatPhase={i * 0.7}
            />
          ))}
          {computeEdges().map((e, idx) => (
            <ConnectorLine
              key={`edge-${idx}-${e.from}-${e.to}`}
              from={[xForIndex(e.from, nodes.length) + (e.to > e.from ? 0.65 : -0.65), 0, 0]}
              to={[xForIndex(e.to, nodes.length) + (e.to > e.from ? -0.65 : 0.65), 0, 0]}
              color={e.color}
              active={e.active}
            />
          ))}
          {mode === 'DETECT_CYCLE' && cycleTargetInput.trim() !== '' && nodes.length > 0 && (
            <ConnectorLine
              from={[xForIndex(nodes.length - 1, nodes.length) + 0.5, 0.5, 0]}
              to={[xForIndex(parseInt(cycleTargetInput, 10) || 0, nodes.length), 0.9, 0]}
              color={FAST_COLOR}
              active={false}
            />
          )}
          {step?.phantomValue !== undefined && (
            <>
              <NeonCube position={phantomPosition()} color={DONE_COLOR} label={step.phantomValue} active size={[1.05, 1.05, 1.05]} floatPhase={9} />
              {step.phantomLinkTo !== undefined && step.phantomLinkTo !== null && (
                <ConnectorLine from={phantomPosition()} to={[xForIndex(step.phantomLinkTo, nodes.length), 0, 0]} color={DONE_COLOR} active />
              )}
            </>
          )}
        </SceneShell>
      </div>

      <p className="text-gray-500 text-xs p-6 pt-4 flex-shrink-0 max-w-4xl mx-auto w-full">
        <span style={{ color: CURRENT_COLOR }}>Amber</span> = current/slow pointer · {' '}
        <span style={{ color: FAST_COLOR }}>Magenta</span> = fast pointer · {' '}
        <span style={{ color: DONE_COLOR }}>Lime</span> = new node / reversed section / meeting point · {' '}
        <span style={{ color: DELETE_COLOR }}>Red</span> = marked for removal.
      </p>
    </div>
  );
}