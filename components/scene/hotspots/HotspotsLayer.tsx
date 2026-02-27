'use client';

import { HotspotMesh } from './HotspotMesh';
import { COMPUTER_HOTSPOT } from '@/lib/constants';

// Single hotspot — the laptop screen on the desk.
// Tune position via console debug: [ComputerModel] size / center logs.
export function HotspotsLayer() {
  return (
    <group name="hotspots">
      <HotspotMesh
        config={{
          position: COMPUTER_HOTSPOT.position,
          rotation: COMPUTER_HOTSPOT.rotation,
          scale: COMPUTER_HOTSPOT.scale,
          shape: 'box',
          label: 'View Projects',
        }}
      />
    </group>
  );
}
