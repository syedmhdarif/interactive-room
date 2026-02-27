'use client';

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { MODEL_CONFIG } from '@/lib/constants';
import * as THREE from 'three';

export function TableModel() {
  const { scene } = useGLTF('/models/Table.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
      }
    });

    // Debug — log bounding box so we can tune computer y-offset
    const box    = new THREE.Box3().setFromObject(scene);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log('[TableModel] size:', size, '| center:', center);
    console.log('[TableModel] table-top y ≈', box.max.y, '← use this for computer position.y');
  }, [scene]);

  const { position, scale, rotation } = MODEL_CONFIG.table;

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

useGLTF.preload('/models/Table.glb');
