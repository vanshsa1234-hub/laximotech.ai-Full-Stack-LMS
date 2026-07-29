'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

interface ConnectorLineProps {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  active?: boolean;
}

// A thin glowing "rod" mesh between two points — built from plain Three.js
// primitives only (no drei Line2/fat-line internals), so it can't silently
// break the rest of the scene if something about that specialized geometry
// isn't happy in a given browser/GPU.
export function ConnectorLine({ from, to, color, active = false }: ConnectorLineProps) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = new THREE.Vector3().subVectors(end, start);
    const len = direction.length();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { position: mid, quaternion: quat, length: len };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.045, 0.045, length, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={active ? 3 : 1.4}
        toneMapped={false}
      />
    </mesh>
  );
}