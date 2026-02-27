'use client';

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { MODEL_CONFIG } from '@/lib/constants';
import * as THREE from 'three';

export function PlantModel() {
  const { scene } = useGLTF('/models/Anemone_Hybrida.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log('[PlantModel] size:', size, 'center:', center);
  }, [scene]);

  const { position, scale, rotation } = MODEL_CONFIG.plant;

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

useGLTF.preload('/models/Anemone_Hybrida.glb');
