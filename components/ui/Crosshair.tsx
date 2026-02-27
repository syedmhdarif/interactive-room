'use client';

import { useScene } from '@/components/providers/SceneProvider';

export function Crosshair() {
  const { isLocked, showProjectList } = useScene();

  if (!isLocked || showProjectList) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <line x1="0" y1="10" x2="7" y2="10" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <line x1="13" y1="10" x2="20" y2="10" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <line x1="10" y1="0" x2="10" y2="7" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <line x1="10" y1="13" x2="10" y2="20" stroke="white" strokeWidth="1.5" opacity="0.6" />
        <circle cx="10" cy="10" r="1.2" fill="white" opacity="0.8" />
      </svg>
    </div>
  );
}
