'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── GLSL shaders ─────────────────────────────────────────────────────────────

// Vertex shader: actual geometry displacement so the curtain physically ripples
const auroraVert = /* glsl */ `
  uniform float u_time;
  uniform float u_speed;

  varying vec2  vUv;
  varying float vIntensity;

  void main() {
    vUv = uv;

    float t = u_time * u_speed;

    // Layered horizontal waves → actual Y displacement of the curtain geometry
    float wave =
        sin(position.x * 0.090 + t * 0.55) * 3.2 +
        sin(position.x * 0.210 - t * 0.38) * 1.6 +
        cos(position.x * 0.055 + t * 0.20) * 2.4 +
        sin(position.x * 0.380 + t * 0.72) * 0.7 +
        cos(position.x * 0.600 - t * 1.10) * 0.3;

    // Slow per-column intensity envelope (makes some columns brighter/dimmer)
    vIntensity = 0.5 + 0.5 * sin(position.x * 0.12 + t * 0.22);

    vec3 pos  = position;
    pos.y    += wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader: rays + shimmer + rich 3-color mixing
const auroraFrag = /* glsl */ `
  uniform float u_time;
  uniform float u_speed;
  uniform vec3  u_color1;
  uniform vec3  u_color2;
  uniform vec3  u_color3;

  varying vec2  vUv;
  varying float vIntensity;

  void main() {
    float t = u_time * u_speed;

    // ── Core ribbon brightness ─────────────────────────────────────────────
    float yDist = abs(vUv.y - 0.5) * 2.0;   // 0 at mid-height, 1 at edges
    float core  = exp(-yDist * yDist * 5.0) * 2.0;
    float glow  = exp(-yDist * yDist * 1.2) * 0.55;
    float alpha = core + glow;

    // ── Vertical ray streaks (characteristic of real aurora) ──────────────
    float r1 = sin(vUv.x * 55.0  + t * 0.28) * 0.5 + 0.5;
    float r2 = sin(vUv.x * 110.0 - t * 0.45) * 0.5 + 0.5;
    float r3 = sin(vUv.x * 24.0  + t * 0.60) * 0.5 + 0.5;
    // Rays are stronger at top of the curtain (aurora rays rise upward)
    float rayMask = mix(1.0, r1 * r2 + r3 * 0.4, smoothstep(0.3, 0.9, vUv.y) * 0.55);

    // ── Shimmer / micro-flicker ────────────────────────────────────────────
    float shimmer = sin(vUv.x * 18.0 + t * 4.2 + vUv.y * 10.0) * 0.07 + 0.93;

    // ── Slow dramatic pulse across the ribbon ─────────────────────────────
    float pulse = sin(t * 0.35 + vUv.x * 1.8) * 0.16 + 0.84;

    // ── Column brightness envelope ─────────────────────────────────────────
    float colEnv = mix(0.55, 1.0, vIntensity);

    alpha *= rayMask * shimmer * pulse * colEnv;

    // ── Rich 3-color mixing over time + space ─────────────────────────────
    float cf1  = sin(vUv.x * 1.8 + t * 0.28) * 0.5 + 0.5;
    float cf2  = sin(vUv.x * 3.2 - t * 0.18 + vUv.y * 2.5) * 0.5 + 0.5;
    float cf3  = cos(vUv.x * 0.9 + t * 0.40) * 0.5 + 0.5;

    vec3 color = mix(u_color1, u_color2, cf1);
    color      = mix(color, u_color3, cf2 * cf3 * 0.55);

    // Extra white brightness at the very core
    color += vec3(0.22) * clamp(core * 0.45, 0.0, 1.0);

    // Saturation boost (vivid, not washed out)
    float lum  = dot(color, vec3(0.299, 0.587, 0.114));
    color      = mix(vec3(lum), color, 1.5);
    color      = clamp(color, 0.0, 1.8); // allow slight bloom

    // ── Edge fades ────────────────────────────────────────────────────────
    float edgeX   = smoothstep(0.0, 0.05, vUv.x) * smoothstep(0.0, 0.05, 1.0 - vUv.x);
    float edgeBot  = smoothstep(0.0, 0.14, vUv.y);
    float edgeTop  = smoothstep(0.0, 0.07, 1.0 - vUv.y);

    float finalAlpha = clamp(alpha * edgeX * edgeBot * edgeTop, 0.0, 1.0);
    gl_FragColor = vec4(color, finalAlpha);
  }
`;

// ── AuroraRibbon ─────────────────────────────────────────────────────────────

interface RibbonProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  color1: string;
  color2: string;
  color3?: string;
  timeOffset?: number;
  speedMult?: number;
  segmentsX?: number;
}

function AuroraRibbon({
  position,
  rotation = [0, 0, 0],
  width,
  height,
  color1,
  color2,
  color3,
  timeOffset = 0,
  speedMult = 1.0,
  segmentsX = 80,
}: RibbonProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   auroraVert,
        fragmentShader: auroraFrag,
        uniforms: {
          u_time:   { value: 0 },
          u_speed:  { value: speedMult },
          u_color1: { value: new THREE.Color(color1) },
          u_color2: { value: new THREE.Color(color2) },
          u_color3: { value: new THREE.Color(color3 ?? color1) },
        },
        transparent: true,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
        side:        THREE.DoubleSide,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.uniforms.u_time.value = clock.elapsedTime + timeOffset;
  });

  return (
    <mesh position={position} rotation={rotation}>
      {/* High X-segment count so vertex displacement is smooth */}
      <planeGeometry args={[width, height, segmentsX, 6]} />
      <primitive ref={matRef} object={material} attach="material" />
    </mesh>
  );
}

// ── TwinklingStars ─────────────────────────────────────────────────────────

const starVert = /* glsl */ `
  attribute float a_phase;
  attribute float a_size;
  attribute float a_speed;

  uniform float u_time;

  varying float v_bright;
  varying float v_phase;

  void main() {
    // Multi-frequency twinkling per star
    float t =
        sin(u_time * a_speed       + a_phase) * 0.35 +
        sin(u_time * a_speed * 2.3 + a_phase * 1.7) * 0.10 +
        sin(u_time * a_speed * 0.5 + a_phase * 0.8) * 0.05;
    v_bright = clamp(0.4 + t, 0.0, 1.0);
    v_phase  = a_phase;

    gl_PointSize = a_size * (0.6 + t * 0.8);
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starFrag = /* glsl */ `
  varying float v_bright;
  varying float v_phase;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float r  = length(uv) * 2.0;
    if (r > 1.0) discard;

    // Sharp bright core + soft outer halo
    float core  = exp(-r * r * 8.0) * 1.4;
    float halo  = (1.0 - r * r);
    float alpha = (core + halo * 0.25) * v_bright;

    // Colour varies: blue-white stars + occasional warm stars
    float warm  = step(0.92, fract(v_phase * 0.159));  // ~8% warm stars
    vec3 cold   = vec3(0.80, 0.90, 1.00);
    vec3 warmC  = vec3(1.00, 0.90, 0.70);
    vec3 col    = mix(cold, warmC, warm);

    gl_FragColor = vec4(col, alpha);
  }
`;

const STAR_COUNT  = 11000;
const STAR_RADIUS = 400;

function TwinklingStars() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const [geometry, material] = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const phases    = new Float32Array(STAR_COUNT);
    const sizes     = new Float32Array(STAR_COUNT);
    const speeds    = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);

      positions[i * 3]     = STAR_RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = STAR_RADIUS * Math.cos(phi);
      positions[i * 3 + 2] = STAR_RADIUS * Math.sin(phi) * Math.sin(theta);

      phases[i] = Math.random() * Math.PI * 2;
      sizes[i]  = 1.0 + Math.random() * 3.0; // 1–4 px (more variation)
      speeds[i] = 1.4 + Math.random() * 2.2; // each star twinkles at its own rate
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('a_phase',  new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('a_size',   new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('a_speed',  new THREE.BufferAttribute(speeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader:   starVert,
      fragmentShader: starFrag,
      uniforms: { u_time: { value: 0 } },
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    return [geo, mat];
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.u_time.value = clock.elapsedTime;
  });

  return (
    <points geometry={geometry}>
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  );
}

// ── TwilightHorizon ──────────────────────────────────────────────────────────

function TwilightHorizon() {
  return (
    <>
      {/* Deep teal-blue base near the horizon */}
      <mesh position={[0, -4, 0]}>
        <cylinderGeometry args={[320, 320, 18, 48, 1, true]} />
        <meshBasicMaterial color="#0a2240" transparent opacity={0.7} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Mid indigo band */}
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[320, 320, 24, 48, 1, true]} />
        <meshBasicMaterial color="#081830" transparent opacity={0.45} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Subtle aurora-green ground glow right at horizon */}
      <mesh position={[0, -8, 0]}>
        <cylinderGeometry args={[280, 280, 10, 48, 1, true]} />
        <meshBasicMaterial color="#003820" transparent opacity={0.35} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}

// ── AuroraSky ─────────────────────────────────────────────────────────────────

export function AuroraSky() {
  return (
    <group name="aurora-sky">
      {/* Deep night sky dome */}
      <mesh>
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial color="#020709" side={THREE.BackSide} depthWrite={false} />
      </mesh>

      <TwilightHorizon />
      <TwinklingStars />

      {/* ── Aurora curtains ─────────────────────────────────────────────── */}

      {/* 1 — Main vivid green sweep — wide, dominant, center-sky */}
      <AuroraRibbon
        position={[0, 22, -60]}
        rotation={[0.07, 0, 0]}
        width={150} height={34}
        color1="#00ff88" color2="#00ffcc" color3="#00ddff"
        timeOffset={0} speedMult={1.0}
      />

      {/* 2 — Teal-cyan arc — left of center */}
      <AuroraRibbon
        position={[-40, 20, -50]}
        rotation={[0.06, 0.25, 0]}
        width={110} height={28}
        color1="#00ccff" color2="#0055ff" color3="#00ffaa"
        timeOffset={3.4} speedMult={0.9}
      />

      {/* 3 — Electric violet arc — right of center */}
      <AuroraRibbon
        position={[38, 25, -45]}
        rotation={[0.09, -0.22, 0]}
        width={115} height={30}
        color1="#bb22ff" color2="#ff33cc" color3="#7700ff"
        timeOffset={6.8} speedMult={1.1}
      />

      {/* 4 — Lower green band — gives depth & fills horizon */}
      <AuroraRibbon
        position={[5, 13, -72]}
        rotation={[0.16, 0.05, 0]}
        width={130} height={22}
        color1="#00ff55" color2="#55ffaa" color3="#00ccaa"
        timeOffset={1.9} speedMult={0.75}
      />

      {/* 5 — High pink-magenta arch — top of dome, soft */}
      <AuroraRibbon
        position={[-12, 32, -52]}
        rotation={[0.04, -0.12, 0]}
        width={100} height={20}
        color1="#ff44cc" color2="#cc00ff" color3="#ff88ff"
        timeOffset={9.5} speedMult={0.85}
      />

      {/* 6 — Far-back blue-white faint band — adds sky depth */}
      <AuroraRibbon
        position={[0, 18, -95]}
        rotation={[0.12, 0, 0]}
        width={160} height={26}
        color1="#88ccff" color2="#4488ff" color3="#00ffcc"
        timeOffset={5.2} speedMult={0.6}
      />

      {/* 7 — Left side curtain wrapping around */}
      <AuroraRibbon
        position={[-75, 22, -30]}
        rotation={[0.08, 1.1, 0]}
        width={90} height={26}
        color1="#00ff99" color2="#0088ff" color3="#44ffcc"
        timeOffset={7.3} speedMult={0.95}
      />

      {/* 8 — Right side curtain wrapping around */}
      <AuroraRibbon
        position={[75, 20, -30]}
        rotation={[0.08, -1.1, 0]}
        width={90} height={24}
        color1="#aa00ff" color2="#ff0099" color3="#ff88cc"
        timeOffset={4.1} speedMult={1.05}
      />
    </group>
  );
}
