'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Trash2, RotateCcw, Play } from 'lucide-react';
import { NEON, gridBackgroundStyle, neonBoxStyle, neonGlowFilter } from './dsa-theme';

interface ListNode {
  id: number;
  value: number;
}

const COLOR = NEON.LINKED_LIST;

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

  return (
    <div className="w-full h-full overflow-y-auto" style={gridBackgroundStyle}>
      <div className="max-w-4xl mx-auto p-6">
        <h3 className="font-semibold text-sm mb-1" style={{ color: COLOR, textShadow: `0 0 10px ${COLOR}88` }}>
          Singly Linked List
        </h3>

        <div className="flex flex-wrap gap-2 mb-8">
          <OpButton onClick={insertHead} icon={<Plus size={13} />} label="Insert head" complexity="O(1)" disabled={traversing} />
          <OpButton onClick={insertTail} icon={<Plus size={13} />} label="Insert tail" complexity="O(n)" disabled={traversing} />
          <OpButton onClick={deleteHead} icon={<Trash2 size={13} />} label="Delete head" complexity="O(1)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={deleteTail} icon={<Trash2 size={13} />} label="Delete tail" complexity="O(n)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={traverse} icon={<Play size={13} />} label="Traverse" complexity="O(n)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={traversing || nodes.length === 0} />
        </div>

        <div
          className="rounded-2xl p-10 min-h-[220px] flex items-center overflow-x-auto"
          style={{ perspective: '1200px', border: '1px solid rgba(148,163,184,0.15)', background: 'rgba(0,0,0,0.35)' }}
        >
          <span className="text-[11px] text-gray-500 font-mono mr-3 flex-shrink-0">head</span>
          <ArrowRight size={14} className="text-gray-600 flex-shrink-0 mr-4" />

          {nodes.length === 0 ? (
            <span className="text-gray-600 text-sm font-mono">null</span>
          ) : (
            <div className="flex items-center gap-3 flex-wrap" style={{ transformStyle: 'preserve-3d' }}>
              <AnimatePresence initial={false}>
                {nodes.map((n, i) => {
                  const active = highlight === n.id;
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, scale: 0.5, rotateX: -30 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0, y: [0, -3, 0] }}
                      exit={{ opacity: 0, scale: 0.5, rotateX: 30 }}
                      whileHover={{ rotateX: -10, rotateY: 8, scale: 1.06 }}
                      transition={{ duration: 0.3, y: { duration: 2.6 + (i % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' } }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-14 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-base font-bold transition-all duration-300"
                        style={neonBoxStyle(COLOR, active)}
                      >
                        {n.value}
                      </div>
                      <ArrowRight size={16} style={{ color: COLOR, ...neonGlowFilter(COLOR) }} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <span className="text-gray-600 text-sm font-mono">null</span>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs mt-5">
          Notice "insert tail" and "delete tail" cost O(n) here — there's no pointer to the last node, so we have to walk
          the whole list to find it. A real-world list often keeps a <code className="text-gray-400">tail</code> pointer
          to make appends O(1).
        </p>
      </div>
    </div>
  );
}
