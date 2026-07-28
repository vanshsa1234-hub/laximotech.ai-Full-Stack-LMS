'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Layers, ListOrdered, Info, Rows3, Network, Share2, Lock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { LinkedListVisualizer } from '@/components/dsa/linked-list-visualizer';
import { StackVisualizer } from '@/components/dsa/stack-visualizer';
import { QueueVisualizer } from '@/components/dsa/queue-visualizer';
import { NEON, gridBackgroundStyle } from '@/components/dsa/dsa-theme';

type PanelId = 'ABOUT' | 'ARRAY' | 'LINKED_LIST' | 'STACK' | 'QUEUE' | 'TREE' | 'GRAPH';

const ACCENT = '#8B8FFF'; // neutral accent for chrome (sidebar/about), structures keep their own neon color

const TOPICS: { id: PanelId; label: string; icon: any; color?: string; comingSoon?: boolean }[] = [
  { id: 'ABOUT',       label: 'About',       icon: Info },
  { id: 'ARRAY',       label: 'Array',       icon: Rows3,       comingSoon: true },
  { id: 'LINKED_LIST', label: 'Linked List', icon: GitBranch,   color: NEON.LINKED_LIST },
  { id: 'STACK',       label: 'Stack',       icon: Layers,      color: NEON.STACK },
  { id: 'QUEUE',       label: 'Queue',       icon: ListOrdered, color: NEON.QUEUE },
  { id: 'TREE',        label: 'Binary Tree', icon: Network,     comingSoon: true },
  { id: 'GRAPH',       label: 'Graph',       icon: Share2,      comingSoon: true },
];

function SidebarItem({ topic, active, onClick }: { topic: typeof TOPICS[number]; active: boolean; onClick: () => void }) {
  const color = topic.color ?? ACCENT;
  return (
    <button
      onClick={onClick}
      disabled={topic.comingSoon}
      className="w-full flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-xl border transition-all disabled:cursor-not-allowed"
      style={{
        borderColor: active ? color : 'transparent',
        color: topic.comingSoon ? '#4b5563' : active ? color : '#9ca3af',
        background: active ? `${color}14` : 'transparent',
        boxShadow: active ? `0 0 14px ${color}44` : 'none',
      }}
    >
      <topic.icon size={16} className="flex-shrink-0" />
      <span className="flex-1 text-left">{topic.label}</span>
      {topic.comingSoon && (
        <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wide text-gray-600 border border-gray-700 rounded-full px-1.5 py-0.5">
          <Lock size={8} /> Soon
        </span>
      )}
    </button>
  );
}

function AboutPanel() {
  return (
    <div className="w-full h-full overflow-y-auto flex items-center justify-center p-8" style={gridBackgroundStyle}>
      <div className="max-w-xl text-center">
        <span className="inline-block text-[11px] font-mono tracking-widest uppercase text-gray-400 border border-gray-700 rounded-full px-3 py-1 mb-6">
          About this tool
        </span>
        <p className="text-white text-xl sm:text-2xl font-heading font-semibold leading-snug">
          Stop reading about data structures — build them. Push a node, watch a pointer connect,
          pop a stack, and see exactly what's happening under the hood.
        </p>
      </div>
    </div>
  );
}

export default function DsaVisualizerPage() {
  const [active, setActive] = useState<PanelId>('LINKED_LIST');
  const activeTopic = TOPICS.find(t => t.id === active)!;
  const stageColor = activeTopic.color ?? ACCENT;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen" style={{ backgroundColor: '#050608' }}>
        {/* Left sidebar — desktop */}
        <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 border-r border-gray-800 pt-24 pb-6 px-3 sticky top-0 h-screen overflow-y-auto">
          <h2 className="text-white font-heading font-bold text-sm px-3 mb-1">DSA Visualizer</h2>
          <p className="text-gray-500 text-[11px] px-3 mb-5">Pick a structure to explore</p>
          <nav className="flex flex-col gap-1">
            {TOPICS.map(topic => (
              <SidebarItem key={topic.id} topic={topic} active={active === topic.id} onClick={() => setActive(topic.id)} />
            ))}
          </nav>
        </aside>

        {/* Mobile topic switcher */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-b border-gray-800 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActive(topic.id)}
                disabled={topic.comingSoon}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border whitespace-nowrap disabled:opacity-40"
                style={{
                  borderColor: active === topic.id ? (topic.color ?? ACCENT) : 'rgba(148,163,184,0.25)',
                  color: active === topic.id ? (topic.color ?? ACCENT) : '#9ca3af',
                }}
              >
                <topic.icon size={13} /> {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main stage */}
        <div className="flex-1 pt-24 pb-6 px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
          <div className="md:hidden h-10" /> {/* spacer for the fixed mobile topic bar */}
          <div
            className="flex-1 rounded-3xl overflow-hidden"
            style={{ border: `1px solid ${stageColor}33`, boxShadow: `0 0 40px ${stageColor}22` }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full"
              >
                {active === 'ABOUT' && <AboutPanel />}
                {active === 'LINKED_LIST' && <LinkedListVisualizer />}
                {active === 'STACK' && <StackVisualizer />}
                {active === 'QUEUE' && <QueueVisualizer />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}