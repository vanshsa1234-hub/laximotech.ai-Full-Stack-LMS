'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowDown, Plus, Trash2, RotateCcw, Eye } from 'lucide-react';
import { NEON, gridBackgroundStyle } from './dsa-theme';
import { NeonCube } from './three/neon-cube';

const SceneShell = dynamic(() => import('./three/scene-shell').then(m => m.SceneShell), { ssr: false });

interface StackItem {
  id: number;
  value: number;
}

const COLOR = NEON.STACK;
const SPACING = 1.5;

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

export function StackVisualizer() {
  const [items, setItems] = useState<StackItem[]>([
    { id: 1, value: 5 }, { id: 2, value: 12 }, { id: 3, value: 8 },
  ]);
  const [peeking, setPeeking] = useState(false);
  const nextId = useRef(4);

  const push = () => {
    const value = Math.floor(Math.random() * 90) + 10;
    setItems(prev => [...prev, { id: nextId.current++, value }]);
  };

  const pop = () => setItems(prev => prev.slice(0, -1));

  const peek = () => {
    if (items.length === 0 || peeking) return;
    setPeeking(true);
    setTimeout(() => setPeeking(false), 700);
  };

  const clear = () => setItems([]);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col" style={gridBackgroundStyle}>
      <div className="max-w-3xl mx-auto w-full p-6 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-1" style={{ color: COLOR, textShadow: `0 0 10px ${COLOR}88` }}>
          Stack (LIFO) — 3D
        </h3>
        <p className="text-gray-400 text-xs mb-5">
          Last in, first out — you can only push onto the top and pop from the top, like a stack of glowing plates.
        </p>

        <div className="flex flex-wrap gap-2">
          <OpButton onClick={push} icon={<Plus size={13} />} label="Push" complexity="O(1)" />
          <OpButton onClick={pop} icon={<Trash2 size={13} />} label="Pop" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={peek} icon={<Eye size={13} />} label="Peek" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={items.length === 0} />
        </div>
      </div>

      <div className="relative flex-1 min-h-[420px]">
        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-gray-600 text-sm font-mono">empty stack</span>
          </div>
        )}
        {items.length > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-center gap-1 text-[11px] font-mono"
            style={{ color: peeking ? COLOR : '#6b7280' }}>
            top <ArrowDown size={12} />
          </div>
        )}
        <SceneShell accent={COLOR} cameraPosition={[3, 1.5, 8]}>
          {items.map((item, i) => {
            const isTop = i === items.length - 1;
            return (
              <NeonCube
                key={item.id}
                position={[0, i * SPACING - ((items.length - 1) * SPACING) / 2, 0]}
                color={isTop ? COLOR : '#64748b'}
                label={item.value}
                active={isTop && peeking}
                floatPhase={i * 0.9}
              />
            );
          })}
        </SceneShell>
      </div>

      <p className="text-gray-500 text-xs p-6 pt-4 flex-shrink-0 max-w-3xl mx-auto w-full">
        Common real-world uses: undo history, the browser back button, and function call stacks (which is why deep
        recursion can cause a "stack overflow").
      </p>
    </div>
  );
}