'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { SceneProvider } from '@/components/providers/SceneProvider';
import { Room } from './Room';
import { FirstPersonControls } from './controls/FirstPersonControls';
import { StartOverlay } from '@/components/ui/StartOverlay';
import { Crosshair } from '@/components/ui/Crosshair';
import { InteractionHint } from '@/components/ui/InteractionHint';
import { ProjectModal } from '@/components/ui/ProjectModal';
import { CAMERA_START_POSITION } from '@/lib/constants';

// DOM-based loading bar — useProgress works outside Canvas via a global store
function LoadingBar() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a1a',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        gap: '12px',
      }}
    >
      <div>Loading room... {Math.round(progress)}%</div>
      <div
        style={{
          width: '180px',
          height: '2px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4488ff, #88ccff)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

export function RoomCanvas() {
  return (
    <SceneProvider>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#0a0a1a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Canvas
          camera={{
            fov: 75,
            near: 0.05,
            far: 200,
            position: [...CAMERA_START_POSITION],
          }}
          shadows
          frameloop="always"
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Suspense fallback={null}>
            <Room />
          </Suspense>
          <FirstPersonControls />
        </Canvas>

        {/* DOM overlays — outside Canvas but inside SceneProvider */}
        <LoadingBar />
        <StartOverlay />
        <Crosshair />
        <InteractionHint />
        <ProjectModal />
      </div>
    </SceneProvider>
  );
}
