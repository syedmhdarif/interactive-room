'use client';

import { useScene } from '@/components/providers/SceneProvider';

export function StartOverlay() {
  const { isLocked } = useScene();

  if (isLocked) return null;

  const handleClick = () => {
    document.querySelector('canvas')?.requestPointerLock();
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(20, 8, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <p style={{
        color: 'rgba(255, 180, 80, 0.8)',
        fontSize: '0.75rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        marginBottom: '0.75rem',
        fontFamily: 'monospace',
        margin: '0 0 0.75rem',
      }}>
        Floating Sunset World
      </p>

      <h1 style={{
        color: '#ffffff',
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 700,
        marginBottom: '0.4rem',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        margin: '0 0 0.4rem',
      }}>
        Arif&apos;s Room
      </h1>

      <p style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '1rem',
        margin: '0 0 2.5rem',
      }}>
        Interactive 3D Portfolio
      </p>

      <div style={{
        padding: '11px 36px',
        border: '1px solid rgba(255,180,80,0.35)',
        borderRadius: '999px',
        color: 'rgba(255,220,140,0.9)',
        fontSize: '0.88rem',
        fontFamily: 'monospace',
        animation: 'pulse 2.5s ease-in-out infinite',
        marginBottom: '2rem',
      }}>
        Click to Explore
      </div>

      <div style={{
        display: 'flex',
        gap: '2rem',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '0.72rem',
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
      }}>
        <span>WASD · Move</span>
        <span>Mouse · Look</span>
        <span>Click Laptop · Projects</span>
        <span>Shift · Sprint</span>
      </div>
    </div>
  );
}
