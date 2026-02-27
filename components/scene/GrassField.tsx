'use client';

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// ── Seeded deterministic random ───────────────────────────────────────────────
function rand(seed: number): number {
  const s = Math.sin(seed * 9301.0 + 49297.0) * 233280.0;
  return s - Math.floor(s);
}

// ── Config ────────────────────────────────────────────────────────────────────
const FIELD_SIZE   = 80;
const GRASS_COUNT  = 2800;
const FLOWER_COUNT = 200;

// Keep desk area clear of grass/flowers
const DESK_CLEAR = 2.5;
function nearDesk(x: number, z: number) {
  return Math.abs(x) < DESK_CLEAR && Math.abs(z) < DESK_CLEAR;
}

// ── Shared geometries (created once) ─────────────────────────────────────────
const bladeGeo  = new THREE.BoxGeometry(0.022, 0.32, 0.006);
const stemGeo   = new THREE.CylinderGeometry(0.010, 0.013, 0.26, 5);
const bloomGeo  = new THREE.SphereGeometry(0.065, 6, 4);

// ── Data types ────────────────────────────────────────────────────────────────
interface GrassDatum {
  x: number; z: number;
  tiltX: number; tiltZ: number; rotY: number;
  scaleY: number;
}

interface FlowerDatum {
  x: number; z: number; rotY: number;
  stemScale: number; stemY: number; bloomY: number; bloomScale: number;
}

// ── Precompute placement data (stable across renders) ─────────────────────────

function buildGrassData(): GrassDatum[] {
  const out: GrassDatum[] = [];
  const half = FIELD_SIZE / 2 - 1;
  let a = 0;
  while (out.length < GRASS_COUNT && a < GRASS_COUNT * 6) {
    a++;
    const x = (rand(a * 1.13)  - 0.5) * FIELD_SIZE;
    const z = (rand(a * 2.41)  - 0.5) * FIELD_SIZE;
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
  let a = 0;
  while (out.length < FLOWER_COUNT && a < FLOWER_COUNT * 8) {
    a++;
    const x = (rand(a * 7.19 + 100) - 0.5) * FIELD_SIZE * 0.9;
    const z = (rand(a * 3.83 + 200) - 0.5) * FIELD_SIZE * 0.9;
    if (nearDesk(x, z)) continue;
    const i = out.length;
    const stemH = 0.20 + rand(i * 2.3) * 0.18;
    out.push({
      x, z,
      rotY:       rand(i * 9.1) * Math.PI * 2,
      stemScale:  stemH / 0.26,
      stemY:      stemH * 0.5,
      bloomY:     stemH + 0.055,
      bloomScale: 0.75 + rand(i * 4.7) * 0.55,
    });
  }
  return out;
}

// Computed once at module level — no re-computation on re-renders
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
      <meshStandardMaterial
        color="#2e8c18"
        roughness={0.88}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
}

// ── InstancedFlowers ──────────────────────────────────────────────────────────

function InstancedFlowers() {
  const stemRef  = useRef<THREE.InstancedMesh>(null);
  const bloomRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const sm = stemRef.current;
    const bm = bloomRef.current;
    if (!sm || !bm) return;

    const dummy = new THREE.Object3D();

    FLOWER_DATA.forEach((f, i) => {
      // Stem
      dummy.position.set(f.x, f.stemY, f.z);
      dummy.rotation.set(0, f.rotY, 0);
      dummy.scale.set(1, f.stemScale, 1);
      dummy.updateMatrix();
      sm.setMatrixAt(i, dummy.matrix);

      // Bloom
      dummy.position.set(f.x, f.bloomY, f.z);
      dummy.rotation.set(0, f.rotY, 0);
      dummy.scale.setScalar(f.bloomScale);
      dummy.updateMatrix();
      bm.setMatrixAt(i, dummy.matrix);
    });

    sm.instanceMatrix.needsUpdate = true;
    bm.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <>
      <instancedMesh ref={stemRef} args={[stemGeo, undefined, FLOWER_COUNT]}>
        <meshStandardMaterial color="#3a7820" roughness={0.82} />
      </instancedMesh>
      <instancedMesh ref={bloomRef} args={[bloomGeo, undefined, FLOWER_COUNT]}>
        <meshStandardMaterial
          color="#f0c8e8"
          roughness={0.55}
          emissive="#cc66aa"
          emissiveIntensity={0.12}
        />
      </instancedMesh>
    </>
  );
}

// ── GrassField ────────────────────────────────────────────────────────────────

export function GrassField() {
  // Ground color reacts to aurora lighting nicely
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
      <InstancedFlowers />
    </group>
  );
}
