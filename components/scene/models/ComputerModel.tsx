'use client';

import { useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { MODEL_CONFIG } from '@/lib/constants';
import { useScene } from '@/components/providers/SceneProvider';
import * as THREE from 'three';

const HINT: import('@/types/scene').HotspotConfig = {
  position: [0, 0, 0],
  shape: 'box',
  label: 'View Projects',
};

interface HitboxState {
  center: [number, number, number];
  size:   [number, number, number];
}

export function ComputerModel() {
  const { scene } = useGLTF('/models/Computer.glb');
  const { isLocked, setShowProjectList, setNearHotspot } = useScene();
  const [hitbox, setHitbox] = useState<HitboxState | null>(null);

  useEffect(() => {
    // ── shadows ──
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
      }
    });

    // ── Compute bounding box in scene-local space ──────────────────────────
    // setFromObject on the gltf scene (not yet in Three.js scene graph) gives
    // coordinates in the scene root's local space — the same space the
    // <primitive> uses inside our group, so the hitbox will align exactly.
    const box    = new THREE.Box3().setFromObject(scene);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    console.log('[ComputerModel] BB size:', size, '| center:', center);
    console.log('[ComputerModel] yMin (table surface guess):', box.min.y);

    // Add 15% padding on every axis so clicking near the edge still registers
    setHitbox({
      center: [center.x, center.y, center.z],
      size:   [size.x * 1.15, size.y * 1.15, size.z * 1.15],
    });
  }, [scene]);

  const { position, scale, rotation } = MODEL_CONFIG.computer;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isLocked) return;
    setShowProjectList(true);
    document.exitPointerLock();
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isLocked) return;
    setNearHotspot(HINT);
  };

  const handlePointerOut = () => setNearHotspot(null);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* The 3D model */}
      <primitive object={scene} />

      {/* Transparent hitbox — sized to the model's bounding box + 15% padding.
          A single solid box is far more reliable for raycasting than the
          complex GLB geometry (which has holes, thin faces, interior polys). */}
      {hitbox && (
        <mesh
          position={hitbox.center}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <boxGeometry args={hitbox.size} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload('/models/Computer.glb');
