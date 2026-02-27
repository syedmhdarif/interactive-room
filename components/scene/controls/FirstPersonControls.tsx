'use client';

import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  MOVE_SPEED,
  SPRINT_MULTIPLIER,
  ROOM_BOUNDS,
  EYE_HEIGHT,
  CAMERA_START_POSITION,
} from '@/lib/constants';
import { useScene } from '@/components/providers/SceneProvider';

// Key state in module scope — no React re-renders on keypress
const keys = {
  w: false,
  s: false,
  a: false,
  d: false,
  shift: false,
};

// Reusable vectors — allocated once outside component
const front = new THREE.Vector3();
const right = new THREE.Vector3();
const dir = new THREE.Vector3();
const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const UP = new THREE.Vector3(0, 1, 0);

export function FirstPersonControls() {
  const { camera, gl } = useThree();
  const { isLocked, setIsLocked } = useScene();

  // Set starting position on mount
  useEffect(() => {
    camera.position.set(...CAMERA_START_POSITION);
  }, [camera]);

  // Pointer lock lifecycle + mouse look
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      setIsLocked(locked);

      if (locked) {
        // Recenter R3F's raycaster to canvas center every time pointer lock is acquired.
        // Without this, the raycaster stays at where the real cursor was when lock
        // was re-acquired (e.g. the modal close button), causing missed hits on the hitbox.
        const rect = canvas.getBoundingClientRect();
        canvas.dispatchEvent(
          new PointerEvent('pointermove', {
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true,
          })
        );
      }
    };

    const onPointerLockError = () => {
      // Silently ignore — browser may block on first attempt
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= e.movementX * 0.002;
      euler.x -= e.movementY * 0.002;
      // Clamp vertical look (can't look fully up or down)
      euler.x = THREE.MathUtils.clamp(euler.x, -Math.PI / 2.2, Math.PI / 2.2);
      camera.quaternion.setFromEuler(euler);
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [camera, gl, setIsLocked]);

  // WASD keyboard state
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.w = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.s = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.a = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = true;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.shift = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.w = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.s = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.a = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.d = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.shift = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Movement tick
  useFrame(() => {
    if (!isLocked) return;

    const speed = MOVE_SPEED * (keys.shift ? SPRINT_MULTIPLIER : 1);

    camera.getWorldDirection(front);
    front.y = 0;
    front.normalize();

    right.crossVectors(front, UP);

    dir.set(0, 0, 0);
    if (keys.w) dir.addScaledVector(front, speed);
    if (keys.s) dir.addScaledVector(front, -speed);
    if (keys.a) dir.addScaledVector(right, -speed);
    if (keys.d) dir.addScaledVector(right, speed);

    camera.position.add(dir);

    camera.position.x = THREE.MathUtils.clamp(
      camera.position.x,
      ROOM_BOUNDS.minX,
      ROOM_BOUNDS.maxX
    );
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      ROOM_BOUNDS.minZ,
      ROOM_BOUNDS.maxZ
    );
    camera.position.y = EYE_HEIGHT;
  });

  // No Three.js component — everything is managed via native DOM events
  return null;
}
