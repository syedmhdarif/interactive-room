'use client';

import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { HotspotConfig } from '@/types/scene';
import { useScene } from '@/components/providers/SceneProvider';

interface HotspotMeshProps {
  config: HotspotConfig;
}

export function HotspotMesh({ config }: HotspotMeshProps) {
  const { setShowProjectList, setNearHotspot, isLocked } = useScene();
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isLocked) return;
    setShowProjectList(true);
    document.exitPointerLock();
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isLocked) return;
    setHovered(true);
    setNearHotspot(config);
  };

  const handlePointerOut = () => {
    setHovered(false);
    setNearHotspot(null);
  };

  return (
    <mesh
      ref={meshRef}
      position={config.position}
      rotation={config.rotation ?? [0, 0, 0]}
      scale={config.scale ?? [1, 1, 1]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {config.shape === 'plane' ? (
        <planeGeometry args={[1, 1]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshBasicMaterial
        transparent
        opacity={hovered ? 0.2 : 0}
        color={hovered ? '#ffcc66' : '#ffffff'}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
