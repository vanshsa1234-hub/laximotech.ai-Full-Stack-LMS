'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, Trash2, RotateCcw, Play } from 'lucide-react';

interface ListNode {
  id: number;
  value: number;
}

const OpButton = ({ onClick, disabled, label, complexity, icon }: {
  onClick: () => void; disabled?: boolean; label: string; complexity: string; icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {icon}
    {label}
    <span className="text-[10px] font-mono text-gray-500">{complexity}</span>
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
    <div className="w-full h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-white font-semibold text-sm mb-1">Singly linked list</h3>
        <p className="text-gray-400 text-xs mb-4">
          Each node stores a value and a pointer to the next node. Try the operations below and watch the pointers update.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <OpButton onClick={insertHead} icon={<Plus size={13} />} label="Insert head" complexity="O(1)" disabled={traversing} />
          <OpButton onClick={insertTail} icon={<Plus size={13} />} label="Insert tail" complexity="O(n)" disabled={traversing} />
          <OpButton onClick={deleteHead} icon={<Trash2 size={13} />} label="Delete head" complexity="O(1)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={deleteTail} icon={<Trash2 size={13} />} label="Delete tail" complexity="O(n)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={traverse} icon={<Play size={13} />} label="Traverse" complexity="O(n)" disabled={traversing || nodes.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={traversing || nodes.length === 0} />
        </div>

        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-6 min-h-[160px] flex items-center overflow-x-auto">
          <span className="text-[11px] text-gray-500 font-mono mr-3 flex-shrink-0">head</span>
          <ArrowRight size={14} className="text-gray-600 flex-shrink-0 mr-3" />

          {nodes.length === 0 ? (
            <span className="text-gray-600 text-sm font-mono">null</span>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <AnimatePresence initial={false}>
                {nodes.map((n, i) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-12 h-12 rounded-lg border flex items-center justify-center font-mono text-sm font-semibold transition-colors ${
                      highlight === n.id ? 'bg-brand-blue border-brand-blue text-white' : 'bg-gray-800 border-gray-700 text-gray-100'
                    }`}>
                      {n.value}
                    </div>
                    <ArrowRight size={14} className="text-gray-600" />
                  </motion.div>
                ))}
              </AnimatePresence>
              <span className="text-gray-600 text-sm font-mono">null</span>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs mt-4">
          Notice "insert tail" and "delete tail" cost O(n) here — there's no pointer to the last node, so we have to walk
          the whole list to find it. A real-world list often keeps a <code className="text-gray-400">tail</code> pointer
          to make appends O(1).
        </p>
      </div>
    </div>
  );
}
