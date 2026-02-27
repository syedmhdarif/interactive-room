'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ── Seeded deterministic random ───────────────────────────────────────────────
function rand(seed: number): number {
  const s = Math.sin(seed * 9301.0 + 49297.0) * 233280.0;
  return s - Math.floor(s);
}

// ── Config ────────────────────────────────────────────────────────────────────
const FIELD_SIZE   = 50;
const GRASS_COUNT  = 2800;
const FLOWER_COUNT = 2200;

// Keep desk area clear
const DESK_CLEAR = 2.5;
function nearDesk(x: number, z: number) {
  return Math.abs(x) < DESK_CLEAR && Math.abs(z) < DESK_CLEAR;
}

// ── Grass geometry (created once) ─────────────────────────────────────────────
const bladeGeo = new THREE.BoxGeometry(0.022, 0.32, 0.006);

// ── Data types ────────────────────────────────────────────────────────────────
interface GrassDatum {
  x: number; z: number;
  tiltX: number; tiltZ: number; rotY: number;
  scaleY: number;
}

interface FlowerDatum {
  x: number; z: number;
  rotY: number;
  scale: number;
}

// ── Precompute placement data (stable across renders) ─────────────────────────

function buildGrassData(): GrassDatum[] {
  const out: GrassDatum[] = [];
  const half = FIELD_SIZE / 2 - 1;
  let a = 0;
  while (out.length < GRASS_COUNT && a < GRASS_COUNT * 6) {
    a++;
    const x = (rand(a * 1.13) - 0.5) * FIELD_SIZE;
    const z = (rand(a * 2.41) - 0.5) * FIELD_SIZE;
    if (nearDesk(x, z)) continue;
    if (Math.abs(x) > half || Math.abs(z) > half) continue;
    const i = out.length;
    out.push({
      x, z,
      tiltX:  (rand(i * 3.7) - 0.5) * 0.4,
      tiltZ:  (rand(i * 5.1) - 0.5) * 0.4,
      rotY:    rand(i * 6.3) * Math.PI * 2,
      scaleY:  0.6 + rand(i * 4.9) * 0.8,
    });
  }
  return out;
}

function buildFlowerData(): FlowerDatum[] {
  const out: FlowerDatum[] = [];
  const half = FIELD_SIZE / 2 - 3;
  let a = 0;
  while (out.length < FLOWER_COUNT && a < FLOWER_COUNT * 10) {
    a++;
    const x = (rand(a * 7.19 + 100) - 0.5) * FIELD_SIZE * 0.82;
    const z = (rand(a * 3.83 + 200) - 0.5) * FIELD_SIZE * 0.82;
    if (nearDesk(x, z)) continue;
    if (Math.abs(x) > half || Math.abs(z) > half) continue;
    const i = out.length;
    out.push({
      x, z,
      rotY:  rand(i * 9.1) * Math.PI * 2,
      scale: 0.35 + rand(i * 4.7) * 0.35, // 0.35–0.70 — tune if model is too big/small
    });
  }
  return out;
}

const GRASS_DATA  = buildGrassData();
const FLOWER_DATA = buildFlowerData();

// ── InstancedGrass ────────────────────────────────────────────────────────────

function InstancedGrass() {
  const ref = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    GRASS_DATA.forEach((g, i) => {
      dummy.position.set(g.x, g.scaleY * 0.16, g.z);
      dummy.rotation.set(g.tiltX, g.rotY, g.tiltZ);
      dummy.scale.set(1, g.scaleY, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={ref} args={[bladeGeo, undefined, GRASS_COUNT]} receiveShadow>
      <meshStandardMaterial color="#2e8c18" roughness={0.88} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ── FlowerGarden — Flower.glb placed many times across the field ──────────────

function FlowerGarden() {
  const { scene } = useGLTF('/models/Flower.glb');

  // Enable shadows on the source scene once — clones inherit material refs
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
    box.getSize(size);
    console.log('[FlowerGarden] GLB size:', size, '— tune scale in buildFlowerData()');
  }, [scene]);

  return (
    <>
      {FLOWER_DATA.map((f, i) => (
        <Clone
          key={i}
          object={scene}
          position={[f.x, 0, f.z]}
          rotation={[0, f.rotY, 0]}
          scale={f.scale}
        />
      ))}
    </>
  );
}

// ── GrassField ────────────────────────────────────────────────────────────────

export function GrassField() {
  const groundColor = useMemo(() => new THREE.Color('#1a4010'), []);

  return (
    <group name="grass-field">
      {/* Main ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[FIELD_SIZE, FIELD_SIZE]} />
        <meshStandardMaterial color={groundColor} roughness={0.95} />
      </mesh>

      {/* Slightly lighter clearing around the desk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#22520e" roughness={0.9} />
      </mesh>

      <InstancedGrass />
      <Suspense fallback={null}>
        <FlowerGarden />
      </Suspense>
    </group>
  );
}

useGLTF.preload('/models/Flower.glb');
