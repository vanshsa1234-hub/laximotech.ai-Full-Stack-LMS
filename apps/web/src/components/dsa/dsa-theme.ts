import type { CSSProperties } from 'react';

// Shared "neon on a blueprint grid" visual language for the DSA Visualizer feature.
// Each structure gets its own neon accent color; everything sits on a black
// background with a faint light-gray grid (horizontal + vertical lines).

export const NEON = {
  LINKED_LIST: '#00F0FF', // electric cyan
  STACK:       '#FF2E9A', // neon magenta
  QUEUE:       '#39FF88', // neon green
} as const;

export const gridBackgroundStyle: CSSProperties = {
  backgroundColor: '#050608',
  backgroundImage:
    'linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), ' +
    'linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

export function neonBoxStyle(color: string, active = false): CSSProperties {
  return {
    background: active ? `${color}22` : 'rgba(8,10,14,0.9)',
    borderColor: color,
    color,
    boxShadow: active
      ? `0 0 10px ${color}, 0 0 26px ${color}aa, 0 0 50px ${color}55, inset 0 0 16px ${color}33`
      : `0 0 6px ${color}88, 0 0 16px ${color}44, inset 0 0 10px ${color}1a`,
  };
}

export function neonGlowFilter(color: string): CSSProperties {
  return { filter: `drop-shadow(0 0 6px ${color})` };
}
