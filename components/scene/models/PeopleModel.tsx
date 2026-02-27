'use client';

import { useEffect } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { MODEL_CONFIG } from '@/lib/constants';
import * as THREE from 'three';

const bubbleStyle: React.CSSProperties = {
  background: 'rgba(10, 20, 40, 0.88)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1.5px solid rgba(0, 220, 160, 0.55)',
  borderRadius: '14px',
  padding: '10px 16px',
  color: '#d0ffe8',
  fontSize: '13px',
  fontFamily: 'monospace',
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  boxShadow: '0 0 20px rgba(0,200,120,0.25), 0 4px 16px rgba(0,0,0,0.5)',
  userSelect: 'none',
  pointerEvents: 'none',
  textAlign: 'center',
};

const tailStyle: React.CSSProperties = {
  width: 0,
  height: 0,
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  borderTop: '10px solid rgba(0, 220, 160, 0.55)',
  margin: '0 auto',
};

export function PeopleModel() {
  const { scene } = useGLTF('/models/People.glb');

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
    console.log('[PeopleModel] size:', size, '| center:', center);
    console.log('[PeopleModel] top y ≈', box.max.y, '← tune BUBBLE_Y with this');
  }, [scene]);

  const { position, scale, rotation } = MODEL_CONFIG.people;

  // Bubble hovers above the character's head.
  // Tune BUBBLE_Y after checking [PeopleModel] top y in the console.
  const BUBBLE_Y = 2.4;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />

      <Html
        position={[0, BUBBLE_Y, 0]}
        center
        distanceFactor={7}
        zIndexRange={[100, 0]}
      >
        <div>
          <div style={bubbleStyle}>
            👆 Click the computer<br />to see my projects!
          </div>
          <div style={tailStyle} />
        </div>
      </Html>
    </group>
  );
}

useGLTF.preload('/models/People.glb');
