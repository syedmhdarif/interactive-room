'use client';

export function RoomLighting() {
  return (
    <>
      {/* Warm sunset ambient — base illumination */}
      <ambientLight intensity={0.8} color="#ffcc88" />

      {/* Hemisphere — warm golden sky top, deep purple ground shadow */}
      <hemisphereLight args={['#ffaa44', '#3a1a4a', 0.9]} />

      {/* Sun — low on the horizon, casting long warm shadows */}
      <directionalLight
        position={[8, 3, -6]}
        intensity={3.5}
        color="#ff7733"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Soft fill from the opposite side — blue-purple dusk tone */}
      <directionalLight
        position={[-5, 2, 3]}
        intensity={0.6}
        color="#8844cc"
      />

      {/* Warm point light near the house — cozy window glow */}
      <pointLight
        position={[-2, 1.5, -0.5]}
        intensity={4}
        color="#ffaa44"
        distance={4}
        decay={2}
      />

      {/* Computer screen glow — soft cool blue */}
      <pointLight
        position={[1.5, 1.2, -0.2]}
        intensity={1.5}
        color="#88bbff"
        distance={2}
        decay={2}
      />
    </>
  );
}
