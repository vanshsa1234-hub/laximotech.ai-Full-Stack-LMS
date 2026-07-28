'use client';

import { Line } from '@react-three/drei';

interface ConnectorLineProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  active?: boolean;
}

export function ConnectorLine({ from, to, color, active = false }: ConnectorLineProps) {
  return (
    <Line
      points={[from, to]}
      color={active ? '#ffffff' : color}
      lineWidth={active ? 4 : 2.5}
      transparent
      opacity={0.9}
    />
  );
}