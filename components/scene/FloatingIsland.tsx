'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── noise helpers ─────────────────────────────────────────────
function smoothNoise(x: number, z: number): number {
  return (
    Math.sin(x * 1.3 + z * 0.7) * 0.30 +
    Math.sin(x * 2.1 - z * 1.4) * 0.15 +
    Math.sin(x * 0.5 + z * 1.9) * 0.20 +
    Math.cos(x * 3.2 + z * 2.5) * 0.08 +
    Math.sin(x * 4.1 - z * 3.3) * 0.04
  );
}

// ── constants ─────────────────────────────────────────────────
const ISLAND_RADIUS = 5.2;
const FLAT_ZONE     = 2.2;  // center is kept flat for models/walking

// ── terrain geometry ──────────────────────────────────────────
function buildTerrainGeo() {
  const SEG = 48;
  const geo = new THREE.PlaneGeometry(
    ISLAND_RADIUS * 2,
    ISLAND_RADIUS * 2,
    SEG, SEG
  );
  geo.rotateX(-Math.PI / 2);

  const pos    = geo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const x    = pos.getX(i);
    const z    = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z);

    // ── height ──────────────────────────────────────────────
    let y: number;
    const n = smoothNoise(x * 0.38, z * 0.38);

    if (dist < FLAT_ZONE) {
      // flat walkable centre with only a tiny ripple
      y = n * 0.06 + 0.05;
    } else if (dist < ISLAND_RADIUS - 0.6) {
      // transition: rises slightly with noise
      const t = (dist - FLAT_ZONE) / (ISLAND_RADIUS - 0.6 - FLAT_ZONE);
      y = n * (0.06 + t * 0.55) + 0.05;
    } else {
      // cliff edge: abrupt drop
      const overshoot = dist - (ISLAND_RADIUS - 0.6);
      y = n * 0.3 - overshoot * 5.0;
    }
    pos.setY(i, y);

    // ── vertex colour ────────────────────────────────────────
    // centre → bright grass, edges → dirt/rock
    const edgeT = Math.min(Math.max((dist - FLAT_ZONE * 0.6) / (ISLAND_RADIUS * 0.55), 0), 1);
    const jitter = smoothNoise(x * 3.5, z * 3.5) * 0.04;

    // grass: #5e8c3b → dirt: #8b6020
    colors[i * 3]     = 0.37 + edgeT * 0.21 + jitter;
    colors[i * 3 + 1] = 0.55 - edgeT * 0.17 + jitter;
    colors[i * 3 + 2] = 0.23 - edgeT * 0.12;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// ── body geometry (lathe profile) ────────────────────────────
function buildBodyGeo() {
  const pts = [
    new THREE.Vector2(ISLAND_RADIUS - 0.1,  0.00),
    new THREE.Vector2(ISLAND_RADIUS + 0.15, -0.25), // slight ledge overhang
    new THREE.Vector2(ISLAND_RADIUS - 0.3,  -0.70),
    new THREE.Vector2(ISLAND_RADIUS - 1.4,  -1.80),
    new THREE.Vector2(ISLAND_RADIUS - 2.8,  -3.20),
    new THREE.Vector2(ISLAND_RADIUS - 3.8,  -4.50),
    new THREE.Vector2(ISLAND_RADIUS - 4.5,  -5.60),
    new THREE.Vector2(0.80,                  -6.50),
    new THREE.Vector2(0.20,                  -7.20),
    new THREE.Vector2(0.00,                  -7.60),
  ];
  return new THREE.LatheGeometry(pts, 40);
}

// ── stalactite positions ──────────────────────────────────────
const STALACTITES: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
  rot: number;
}> = [
  { pos: [ 0.2, -6.0,  0.3], scale: [0.55, 1.80, 0.55], rot: 0.0 },
  { pos: [-1.6, -5.2,  0.9], scale: [0.38, 1.30, 0.38], rot: 0.4 },
  { pos: [ 1.9, -5.0, -0.4], scale: [0.42, 1.10, 0.42], rot: 1.1 },
  { pos: [-0.7, -5.5, -1.5], scale: [0.30, 1.50, 0.30], rot: 2.0 },
  { pos: [ 1.0, -5.8,  1.3], scale: [0.28, 1.00, 0.28], rot: 3.2 },
  { pos: [-1.1, -4.8, -0.4], scale: [0.48, 0.90, 0.48], rot: 0.8 },
  { pos: [ 2.6, -4.5,  1.1], scale: [0.32, 0.80, 0.32], rot: 1.7 },
  { pos: [ 0.0, -5.2, -1.0], scale: [0.22, 0.70, 0.22], rot: 2.5 },
];

// ── surface rocks ─────────────────────────────────────────────
const SURFACE_ROCKS: Array<{
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
}> = [
  { pos: [-3.5, 0.35, -2.5], scale: [0.28, 0.22, 0.24], rot: [0.3, 0.8, 0.1] },
  { pos: [ 3.8, 0.30,  1.8], scale: [0.22, 0.18, 0.20], rot: [0.1, 1.4, 0.3] },
  { pos: [-2.8, 0.25,  3.0], scale: [0.32, 0.20, 0.28], rot: [0.5, 0.5, 0.2] },
  { pos: [ 2.2, 0.28, -3.5], scale: [0.18, 0.15, 0.20], rot: [0.2, 2.1, 0.4] },
  { pos: [-4.0, 0.38,  1.0], scale: [0.25, 0.20, 0.22], rot: [0.4, 0.3, 0.1] },
];

// ─────────────────────────────────────────────────────────────
export function FloatingIsland() {
  const groupRef  = useRef<THREE.Group>(null);
  const terrainGeo = useMemo(() => buildTerrainGeo(), []);
  const bodyGeo    = useMemo(() => buildBodyGeo(), []);

  // Slow, dreamy bobbing
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      Math.sin(clock.elapsedTime * 0.38) * 0.12;
  });

  return (
    <group ref={groupRef} name="floating-island">

      {/* ── grass / dirt top terrain ─────────────────────── */}
      <mesh geometry={terrainGeo} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      {/* ── rocky island body (sides + taper) ────────────── */}
      <mesh geometry={bodyGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#6b5a42"
          roughness={0.97}
          metalness={0.02}
        />
      </mesh>

      {/* ── dirt rim ring at the top edge ────────────────── */}
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[ISLAND_RADIUS, ISLAND_RADIUS + 0.18, 0.28, 40]} />
        <meshStandardMaterial color="#7a5520" roughness={0.95} />
      </mesh>

      {/* ── hanging stalactites ───────────────────────────── */}
      {STALACTITES.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          scale={s.scale}
          rotation={[Math.PI, s.rot, 0]}
          castShadow
        >
          <coneGeometry args={[1, 2.2, 7]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#5a4a34' : '#4a3c2a'}
            roughness={0.98}
          />
        </mesh>
      ))}

      {/* ── surface rocks as decoration ───────────────────── */}
      {SURFACE_ROCKS.map((r, i) => (
        <mesh
          key={i}
          position={r.pos}
          scale={r.scale}
          rotation={r.rot}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#8a7055' : '#6a5540'}
            roughness={0.95}
          />
        </mesh>
      ))}

      {/* ── stone path (flat stepping stones) ────────────── */}
      {[
        { pos: [-0.8, 0.08,  1.5] as [number,number,number] },
        { pos: [-0.3, 0.07,  0.6] as [number,number,number] },
        { pos: [ 0.2, 0.07, -0.3] as [number,number,number] },
        { pos: [ 0.7, 0.06, -1.2] as [number,number,number] },
      ].map((stone, i) => (
        <mesh key={i} position={stone.pos} rotation={[0, i * 0.4, 0]} receiveShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.06, 7]} />
          <meshStandardMaterial color="#9a8870" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
