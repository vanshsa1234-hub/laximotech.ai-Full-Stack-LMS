'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Trash2, RotateCcw, Eye } from 'lucide-react';
import { NEON, gridBackgroundStyle } from './dsa-theme';
import { NeonCube } from './three/neon-cube';

const SceneShell = dynamic(() => import('./three/scene-shell').then(m => m.SceneShell), { ssr: false });

interface QueueItem {
  id: number;
  value: number;
}

const COLOR = NEON.QUEUE;
const SPACING = 2.0;

const OpButton = ({ onClick, disabled, label, complexity, icon }: {
  onClick: () => void; disabled?: boolean; label: string; complexity: string; icon?: React.ReactNode;
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
    <span className="text-[10px] font-mono" style={{ color: `${COLOR}aa` }}>{complexity}</span>
  </button>
);

export function QueueVisualizer() {
  const [items, setItems] = useState<QueueItem[]>([
    { id: 1, value: 3 }, { id: 2, value: 7 }, { id: 3, value: 15 },
  ]);
  const [peeking, setPeeking] = useState(false);
  const nextId = useRef(4);

  const enqueue = () => {
    const value = Math.floor(Math.random() * 90) + 10;
    setItems(prev => [...prev, { id: nextId.current++, value }]);
  };

  const dequeue = () => setItems(prev => prev.slice(1));

  const peek = () => {
    if (items.length === 0 || peeking) return;
    setPeeking(true);
    setTimeout(() => setPeeking(false), 700);
  };

  const clear = () => setItems([]);

  const offset = ((items.length - 1) * SPACING) / 2;

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col" style={gridBackgroundStyle}>
      <div className="max-w-4xl mx-auto w-full p-6 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-1" style={{ color: COLOR, textShadow: `0 0 10px ${COLOR}88` }}>
          Queue (FIFO) — 3D
        </h3>
        <p className="text-gray-400 text-xs mb-5">
          First in, first out — new cubes join at the rear, and only the cube at the front can leave.
        </p>

        <div className="flex flex-wrap gap-2">
          <OpButton onClick={enqueue} icon={<Plus size={13} />} label="Enqueue" complexity="O(1)" />
          <OpButton onClick={dequeue} icon={<Trash2 size={13} />} label="Dequeue" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={peek} icon={<Eye size={13} />} label="Peek front" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={items.length === 0} />
        </div>
      </div>

      <div className="relative flex-1 min-h-[380px]">
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-gray-600 text-sm font-mono">empty queue</span>
          </div>
        )}
        {items.length > 0 && (
          <div className="absolute top-4 left-0 right-0 z-10 pointer-events-none flex items-center justify-between px-8 text-[11px] font-mono text-gray-500">
            <span>front</span>
            <span>rear</span>
          </div>
        )}
        <SceneShell accent={COLOR}>
          {items.map((item, i) => {
            const isFront = i === 0;
            return (
              <NeonCube
                key={item.id}
                position={[i * SPACING - offset, 0, 0]}
                color={isFront ? COLOR : '#64748b'}
                label={item.value}
                active={isFront && peeking}
                floatPhase={i * 0.8}
              />
            );
          })}
        </SceneShell>
      </div>

      <p className="text-gray-500 text-xs p-6 pt-4 flex-shrink-0 max-w-4xl mx-auto w-full">
        Common real-world uses: task scheduling, printer job queues, and breadth-first search — anything processed
        in the same order it arrived.
      </p>
    </div>
  );
}