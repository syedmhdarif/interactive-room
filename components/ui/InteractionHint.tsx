'use client';

import { useScene } from '@/components/providers/SceneProvider';

export function InteractionHint() {
  const { isLocked, nearHotspot, showProjectList } = useScene();

  if (!isLocked || !nearHotspot || showProjectList) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        pointerEvents: 'none',
        background: 'rgba(30, 10, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,180,80,0.2)',
        borderRadius: '8px',
        padding: '8px 22px',
        color: 'rgba(255,255,255,0.85)',
        fontSize: '0.82rem',
        fontFamily: 'monospace',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: 'rgba(255,180,80,0.9)', marginRight: '8px' }}>[Click]</span>
      {nearHotspot.label}
    </div>
  );
}
