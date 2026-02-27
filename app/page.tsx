'use client';

import dynamic from 'next/dynamic';

// Three.js uses browser globals (WebGL, window, document).
// Must never render on the server.
const RoomCanvas = dynamic(
  () => import('@/components/scene/RoomCanvas').then((m) => m.RoomCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#0a0a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
        }}
      >
        Initializing...
      </div>
    ),
  }
);

export default function Home() {
  return <RoomCanvas />;
}
