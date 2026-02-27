'use client';

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { MODEL_CONFIG } from '@/lib/constants';
import * as THREE from 'three';

export function HouseModel() {
  const { scene } = useGLTF('/models/House.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Debug: log bounding box to help tune position/scale
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log('[HouseModel] size:', size, 'center:', center);
  }, [scene]);

  const { position, scale, rotation } = MODEL_CONFIG.house;

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

// Clear cached version so the new file is always loaded fresh
useGLTF.clear('/models/House.glb');
useGLTF.preload('/models/House.glb');
