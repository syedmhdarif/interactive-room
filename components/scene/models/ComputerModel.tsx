'use client';

import { useEffect, useRef, useState } from 'react';
import { useGLTF, Text } from '@react-three/drei';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { MODEL_CONFIG } from '@/lib/constants';
import { useScene } from '@/components/providers/SceneProvider';
import * as THREE from 'three';

// ── Screen position in model-local space ─────────────────────────────────────
// Derived from COMPUTER_HOTSPOT world coords inverted through the model group
// transform. Tune if screen visual looks misaligned (check console BB log).
const SCREEN_LOCAL: [number, number, number] = [0, 0.6, 0.05];
const SCREEN_W = 0.46;
const SCREEN_H = 0.30;

// No extra rotation needed — parent group has no rotation, so screen elements
// with default facing (local +Z = world +Z) already face toward the viewer.
const SCREEN_WRAPPER_ROT: [number, number, number] = [0, 0, 0];

const HOVER_HINT = {
  position: [0, 0, 0] as [number, number, number],
  shape: 'box' as const,
  label: 'About Me',
};

export function ComputerModel() {
  const { scene } = useGLTF('/models/Computer.glb');
  const { isLocked, setShowProjectList, setNearHotspot } = useScene();
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
      }
    });

    const box    = new THREE.Box3().setFromObject(scene);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log('[ComputerModel] BB size:', size, '| center:', center);
    console.log('[ComputerModel] Tune SCREEN_LOCAL in ComputerModel.tsx if screen visual looks off');
  }, [scene]);

  // Pulse the outer glow halo
  useFrame((_, delta) => {
    tRef.current += delta;
    if (glowRef.current) {
      const mat   = glowRef.current.material as THREE.MeshBasicMaterial;
      const pulse = Math.sin(tRef.current * 2.0) * 0.5 + 0.5;
      mat.opacity = hovered
        ? 0.35 + pulse * 0.20   // brighter on hover
        : 0.06 + pulse * 0.05;  // subtle idle pulse
    }
  });

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
    setHovered(true);
    setNearHotspot(HOVER_HINT);
  };

  const handlePointerOut = () => {
    setHovered(false);
    setNearHotspot(null);
  };

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 3D model */}
      <primitive object={scene} />

      {/* Screen visuals — wrapper rotation cancels parent so elements face viewer */}
      <group position={SCREEN_LOCAL} rotation={SCREEN_WRAPPER_ROT}>

        {/* Outer pulsing glow halo */}
        <mesh ref={glowRef}>
          <planeGeometry args={[SCREEN_W + 0.14, SCREEN_H + 0.14]} />
          <meshBasicMaterial
            color="#00dca0"
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>

        {/* Border ring */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[SCREEN_W + 0.022, SCREEN_H + 0.022]} />
          <meshBasicMaterial
            color={hovered ? '#00ffcc' : '#00dca0'}
            transparent
            opacity={hovered ? 0.65 : 0.20}
            depthWrite={false}
          />
        </mesh>

        {/* Dark screen background */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshBasicMaterial
            color="#030d1a"
            transparent
            opacity={0.92}
            depthWrite={false}
          />
        </mesh>

        {/* "About Me" heading */}
        <Text
          position={[0, 0.05, 0.003]}
          fontSize={0.072}
          color={hovered ? '#00ffcc' : '#00dca0'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          About Me
        </Text>

        {/* Thin divider line */}
        <mesh position={[0, 0.005, 0.003]}>
          <planeGeometry args={[SCREEN_W * 0.55, 0.003]} />
          <meshBasicMaterial
            color="#00dca0"
            transparent
            opacity={0.35}
            depthWrite={false}
          />
        </mesh>

        {/* Subtitle */}
        <Text
          position={[0, -0.055, 0.003]}
          fontSize={0.026}
          color="#4aeabb"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.10}
        >
          {`[ click to explore ]`}
        </Text>

        {/* Invisible click/hover target — screen area only */}
        <mesh
          position={[0, 0, 0.004]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[SCREEN_W, SCREEN_H]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

useGLTF.preload('/models/Computer.glb');
