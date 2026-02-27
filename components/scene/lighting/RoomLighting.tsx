'use client';

export function RoomLighting() {
  return (
    <>
      {/* ── Base ambient — night sky scattered light ─────────────────────
          Enough to see the scene clearly without washing it out.         */}
      <ambientLight intensity={0.65} color="#1a2a50" />

      {/* Hemisphere — aurora-lit sky (green-blue) + bright ground bounce */}
      <hemisphereLight args={['#1a4060', '#143010', 1.8]} />

      {/* ── Moonlight ──────────────────────────────────────────────────── */}
      <directionalLight
        position={[-10, 20, 10]}
        intensity={1.8}
        color="#d0dcff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* ── Aurora directional fills ────────────────────────────────────
          These cast the aurora color as actual scene light.              */}

      {/* Primary green — from where the main aurora curtain sits */}
      <directionalLight
        position={[0, 30, -60]}
        intensity={2.2}
        color="#00ff88"
      />

      {/* Teal sweep — left arc */}
      <directionalLight
        position={[-40, 25, -45]}
        intensity={1.2}
        color="#00ccff"
      />

      {/* Violet curtain — right arc */}
      <directionalLight
        position={[40, 28, -40]}
        intensity={1.2}
        color="#cc44ff"
      />

      {/* ── Aurora sky glow — large area lights from high above ─────────
          Simulate the aurora casting coloured light down onto the ground. */}

      {/* Green dome light */}
      <pointLight
        position={[0, 45, -50]}
        intensity={40}
        color="#00ff77"
        distance={160}
        decay={1.1}
      />

      {/* Teal dome light */}
      <pointLight
        position={[-40, 38, -45]}
        intensity={25}
        color="#00bbff"
        distance={130}
        decay={1.1}
      />

      {/* Violet dome light */}
      <pointLight
        position={[40, 42, -40]}
        intensity={25}
        color="#bb44ff"
        distance={130}
        decay={1.1}
      />

      {/* ── Scene props ─────────────────────────────────────────────────── */}

      {/* House — warm amber window glow */}
      <pointLight
        position={[6, 2.2, -18]}
        intensity={18}
        color="#ffcc55"
        distance={14}
        decay={2}
      />

      {/* Computer screen — blue-white glow illuminating the desk */}
      <pointLight
        position={[0, 1.5, -0.3]}
        intensity={6}
        color="#aaddff"
        distance={6}
        decay={2}
      />

      {/* Desk fill — gentle aurora green bounce at ground level */}
      <pointLight
        position={[0, 3.5, 1.5]}
        intensity={3}
        color="#00ff99"
        distance={10}
        decay={2}
      />
    </>
  );
}
