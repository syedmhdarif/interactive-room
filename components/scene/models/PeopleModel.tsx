'use client';

import { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { MODEL_CONFIG } from '@/lib/constants';
import * as THREE from 'three';

export function PeopleModel() {
  const { scene } = useGLTF('/models/People.glb');

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
    console.log('[PeopleModel] size:', size, 'center:', center);
  }, [scene]);

  const { position, scale, rotation } = MODEL_CONFIG.people;

  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation}
    />
  );
}

useGLTF.preload('/models/People.glb');
