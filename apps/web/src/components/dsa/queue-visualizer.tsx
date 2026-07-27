'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, Eye } from 'lucide-react';

interface QueueItem {
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

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-white font-semibold text-sm mb-1">Queue (FIFO)</h3>
        <p className="text-gray-400 text-xs mb-4">
          First in, first out — new items join at the rear, and only the item at the front can leave, like a checkout line.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <OpButton onClick={enqueue} icon={<Plus size={13} />} label="Enqueue" complexity="O(1)" />
          <OpButton onClick={dequeue} icon={<Trash2 size={13} />} label="Dequeue" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={peek} icon={<Eye size={13} />} label="Peek front" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={items.length === 0} />
        </div>

        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-6 min-h-[160px] overflow-x-auto">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mb-2 min-w-max">
            <span>front</span>
            <span>rear</span>
          </div>
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-16">
              <span className="text-gray-600 text-sm font-mono">empty queue</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-max">
              <AnimatePresence initial={false}>
                {items.map((item, i) => {
                  const isFront = i === 0;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`w-14 h-14 rounded-lg border flex items-center justify-center font-mono text-sm font-semibold transition-colors ${
                        isFront && peeking ? 'bg-brand-orange border-brand-orange text-white' : isFront ? 'bg-brand-blue border-brand-blue text-white' : 'bg-gray-800 border-gray-700 text-gray-100'
                      }`}
                    >
                      {item.value}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs mt-4">
          Common real-world uses: task scheduling, printer job queues, and breadth-first search — anything processed
          in the same order it arrived.
        </p>
      </div>
    </div>
  );
}
