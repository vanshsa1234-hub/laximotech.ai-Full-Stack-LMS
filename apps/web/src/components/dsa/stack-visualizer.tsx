'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Plus, Trash2, RotateCcw, Eye } from 'lucide-react';

interface StackItem {
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
    <div className="w-full h-full overflow-y-auto bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-white font-semibold text-sm mb-1">Stack (LIFO)</h3>
        <p className="text-gray-400 text-xs mb-4">
          Last in, first out — you can only push onto the top and pop from the top, like a stack of plates.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <OpButton onClick={push} icon={<Plus size={13} />} label="Push" complexity="O(1)" />
          <OpButton onClick={pop} icon={<Trash2 size={13} />} label="Pop" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={peek} icon={<Eye size={13} />} label="Peek" complexity="O(1)" disabled={items.length === 0} />
          <OpButton onClick={clear} icon={<RotateCcw size={13} />} label="Clear" complexity="" disabled={items.length === 0} />
        </div>

        <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-6 min-h-[320px] flex flex-col items-center justify-end">
          {items.length === 0 ? (
            <span className="text-gray-600 text-sm font-mono mb-auto mt-auto">empty stack</span>
          ) : (
            <div className="flex flex-col-reverse items-center gap-1.5">
              <AnimatePresence initial={false}>
                {items.map((item, i) => {
                  const isTop = i === items.length - 1;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3"
                    >
                      {isTop && (
                        <span className={`text-[10px] font-mono transition-colors ${peeking ? 'text-brand-orange' : 'text-gray-500'}`}>
                          top <ArrowDown size={11} className="inline -mt-0.5" />
                        </span>
                      )}
                      <div className={`w-32 h-11 rounded-lg border flex items-center justify-center font-mono text-sm font-semibold transition-colors ${
                        isTop && peeking ? 'bg-brand-orange border-brand-orange text-white' : isTop ? 'bg-brand-blue border-brand-blue text-white' : 'bg-gray-800 border-gray-700 text-gray-100'
                      }`}>
                        {item.value}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs mt-4">
          Common real-world uses: undo history, the browser back button, and function call stacks (which is why deep
          recursion can cause a "stack overflow").
        </p>
      </div>
    </div>
  );
}
