'use client';

import { LinkedListVisualizer } from './linked-list-visualizer';
import { StackVisualizer } from './stack-visualizer';
import { QueueVisualizer } from './queue-visualizer';

export function DsaVisualizer({ vizType }: { vizType?: string | null }) {
  switch (vizType) {
    case 'STACK':
      return <StackVisualizer />;
    case 'QUEUE':
      return <QueueVisualizer />;
    case 'LINKED_LIST':
      return <LinkedListVisualizer />;
    default:
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500 text-sm">
          No visualizer type configured for this lesson yet.
        </div>
      );
  }
}
