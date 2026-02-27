'use client';

import { Suspense } from 'react';
import { Sky } from '@react-three/drei';
import { RoomLighting } from './lighting/RoomLighting';
import { FloatingIsland } from './FloatingIsland';
import { HouseModel } from './models/HouseModel';
import { PlantModel } from './models/PlantModel';
import { PeopleModel } from './models/PeopleModel';
import { ComputerModel } from './models/ComputerModel';
import { HotspotsLayer } from './hotspots/HotspotsLayer';

export function Room() {
  return (
    <group name="world">
      {/* Sunset sky */}
      <Sky
        distance={450000}
        sunPosition={[0.6, 0.08, -1]}
        turbidity={8}
        rayleigh={4}
        mieCoefficient={0.008}
        mieDirectionalG={0.8}
      />

      {/* Warm atmospheric haze at the horizon */}
      <fog attach="fog" args={['#ff9955', 35, 130]} />

      <RoomLighting />

      {/* ── Procedural floating island ── */}
      <FloatingIsland />

      {/* ── Models on the island ── */}
      <Suspense fallback={null}>
        <HouseModel />
      </Suspense>

      <Suspense fallback={null}>
        <PeopleModel />
      </Suspense>

      <Suspense fallback={null}>
        <PlantModel />
      </Suspense>

      <Suspense fallback={null}>
        <ComputerModel />
      </Suspense>

      {/* Clickable hotspot on the laptop screen */}
      <HotspotsLayer />
    </group>
  );
}
