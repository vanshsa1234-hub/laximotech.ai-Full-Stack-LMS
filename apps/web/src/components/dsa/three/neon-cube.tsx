'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges, Text } from '@react-three/drei';
import * as THREE from 'three';

interface NeonCubeProps {
  position: [number, number, number];
  color: string;
  label: string | number;
  active?: boolean;
  size?: [number, number, number]; // width, height, depth
  floatPhase?: number;
}

export function NeonCube({ position, color, label, active = false, size = [1.15, 1.15, 1.15], floatPhase = 0 }: NeonCubeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.1 + floatPhase) * 0.09;
      groupRef.current.rotation.y = Math.sin(t * 0.25 + floatPhase) * 0.15;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        {/* Cuboid geometry, completely filled with an emissive neon material */}
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 3.4 : 1.6}
          metalness={0.35}
          roughness={0.15}
          toneMapped={false}
        />
        <Edges scale={1.01} threshold={15}>
          <lineBasicMaterial color={active ? '#ffffff' : color} toneMapped={false} />
        </Edges>
      </mesh>

      <Text
        position={[0, 0, size[2] / 2 + 0.03]}
        fontSize={size[1] * 0.32}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor={color}
      >
        {String(label)}
      </Text>
    </group>
  );
}