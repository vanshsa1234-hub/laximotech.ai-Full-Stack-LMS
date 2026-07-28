'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

interface SceneShellProps {
  children: React.ReactNode;
  accent: string;
  cameraPosition?: [number, number, number];
}

export function SceneShell({ children, accent, cameraPosition = [0, 2.4, 8] }: SceneShellProps) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: cameraPosition, fov: 45 }} gl={{ antialias: true }}>
      <color attach="background" args={['#050608']} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 5, 6]} intensity={50} color={accent} distance={22} />
      <pointLight position={[-5, -2, -4]} intensity={18} color={accent} distance={20} />
      <directionalLight position={[0, 6, 4]} intensity={0.35} />

      <Suspense fallback={null}>
        <Grid
          position={[0, -1.7, 0]}
          args={[40, 40]}
          cellSize={0.6}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={3}
          sectionThickness={1}
          sectionColor="#475569"
          fadeDistance={22}
          fadeStrength={1}
          infiniteGrid
        />
        {children}
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={16}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.5}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.4} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}