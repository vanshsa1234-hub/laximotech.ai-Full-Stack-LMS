'use client';

import { StackVisualizer } from './stack-visualizer';
import { QueueVisualizer } from './queue-visualizer';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Trash2, RotateCcw, Play } from 'lucide-react';
import { NEON, gridBackgroundStyle } from './dsa-theme';
import { NeonCube } from './three/neon-cube';
import { ConnectorLine } from './three/connector-line';

const SceneShell = dynamic(() => import('./three/scene-shell').then(m => m.SceneShell), { ssr: false });

interface ListNode {
  id: number;
  value: number;
}

const COLOR = NEON.LINKED_LIST;
const SPACING = 2.1;

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

export function LinkedListVisualizer() {
  const [nodes, setNodes] = useState<ListNode[]>([
    { id: 1, value: 4 }, { id: 2, value: 9 }, { id: 3, value: 2 },
  ]);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [traversing, setTraversing] = useState(false);
  const nextId = useRef(4);
  const nextVal = () => Math.floor(Math.random() * 90) + 10;

  const insertHead = () => {
    const node = { id: nextId.current++, value: nextVal() };
    setNodes(prev => [node, ...prev]);
    setHighlight(node.id);
    setTimeout(() => setHighlight(null), 700);
  };

  const insertTail = () => {
    const node = { id: nextId.current++, value: nextVal() };
    setNodes(prev => [...prev, node]);
    setHighlight(node.id);
    setTimeout(() => setHighlight(null), 700);
  };

  const deleteHead = () => setNodes(prev => prev.slice(1));
  const deleteTail = () => setNodes(prev => prev.slice(0, -1));
  const clear = () => setNodes([]);

  const traverse = async () => {
    if (traversing || nodes.length === 0) return;
    setTraversing(true);
    for (const n of nodes) {
      setHighlight(n.id);
      await new Promise(r => setTimeout(r, 450));
    }
    setHighlight(null);
    setTraversing(false);
  };

  const offset = ((nodes.length - 1) * SPACING) / 2;

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col" style={gridBackgroundStyle}>
      <div className="max-w-4xl mx-auto w-full p-6 flex-shrink-0">
        <h3 className="font-semibold text-sm mb-1" style={{ color: COLOR, textShadow: `0 0 10px ${COLOR}88` }}>
          Singly Linked List — 3D
        </h3>
        <p className="text-gray-400 text-xs mb-5">
          Each glowing cube is a node holding a value and a pointer to the next node. Drag to orbit the scene.
        </p>

        <div className="flex flex-wrap gap-2">
          <OpButton onClick={insertHead} icon={<Plus size={13} />} label="Insert head" complexity="O(1)" disabled={traversing} />
          <OpButton onClick={insertTail} icon={<Plus size={13} />} label="Insert tail" complexity="O(n)" disabled={traversing} />
          <OpButton onClick={deleteHead} icon={<Trash2 size={13} />} label="Delete head" complexity="O(1)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={deleteTail} icon={<Trash2 size={13} />} label="Delete tail" complexity="O(n)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={traverse} icon={<Play size={13} />} label="Traverse" complexity="O(n)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={traversing || nodes.length === 0} />
        </div>
      </div>

      <div className="relative flex-1 min-h-[380px]">
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-gray-600 text-sm font-mono">head → null</span>
          </div>
        )}
        <SceneShell accent={COLOR}>
          {nodes.map((n, i) => (
            <NeonCube
              key={n.id}
              position={[i * SPACING - offset, 0, 0]}
              color={COLOR}
              label={n.value}
              active={highlight === n.id}
              floatPhase={i * 0.7}
            />
          ))}
          {nodes.slice(0, -1).map((n, i) => (
            <ConnectorLine
              key={`edge-${n.id}`}
              from={[i * SPACING - offset + 0.6, 0, 0]}
              to={[(i + 1) * SPACING - offset - 0.6, 0, 0]}
              color={COLOR}
              active={highlight === n.id || highlight === nodes[i + 1]?.id}
            />
          ))}
        </SceneShell>
      </div>

      <p className="text-gray-500 text-xs p-6 pt-4 flex-shrink-0 max-w-4xl mx-auto w-full">
        Notice "insert tail" and "delete tail" cost O(n) here — there's no pointer to the last node, so we have to walk
        the whole list to find it. A real-world list often keeps a <code className="text-gray-400">tail</code> pointer
        to make appends O(1).
      </p>
    </div>
  );
}

export function DsaVisualizer({ vizType }: { vizType?: string | null }) {
  switch (vizType) {
    case 'STACK':
      return <StackVisualizer />;
    case 'QUEUE':
      return <QueueVisualizer />;
    case 'LINKED_LIST':
    default:
      return <LinkedListVisualizer />;
  }
}