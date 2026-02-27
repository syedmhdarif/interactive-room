// Camera — edge of island looking inward
export const CAMERA_START_POSITION: [number, number, number] = [0, 2.0, 7];
export const EYE_HEIGHT = 1.7;

// Movement
export const MOVE_SPEED = 0.05;
export const SPRINT_MULTIPLIER = 2.0;

// Player can wander just off the island edge
export const ROOM_BOUNDS = {
  minX: -6,
  maxX: 6,
  minZ: -6,
  maxZ: 7,
};

// GLB model positions — placed on the procedural island.
// Island terrain is flat at y ≈ 0 in the centre (radius ~2.2).
// Adjust scale after checking console debug logs.
export const MODEL_CONFIG = {
  // Small house — left back of island
  house: {
    position: [-2.5, 0.1, -1.5] as [number, number, number],
    scale: 1 as number,
    rotation: [0, Math.PI / 5, 0] as [number, number, number],
  },
  // Person sitting at desk — right of centre
  people: {
    position: [1.8, 0.1, 0.5] as [number, number, number],
    scale: 1 as number,
    rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  },
  // Plant / tree — back centre
  plant: {
    position: [0.2, 0.1, -2.5] as [number, number, number],
    scale: 1 as number,
    rotation: [0, 0.3, 0] as [number, number, number],
  },
  // Laptop on the desk in front of the person
  computer: {
    position: [1.8, 0.9, -0.1] as [number, number, number],
    scale: 1 as number,
    rotation: [0, Math.PI / 2, 0] as [number, number, number],
  },
};

// Hotspot over the laptop screen — adjust after first load
export const COMPUTER_HOTSPOT = {
  position: [1.75, 1.15, -0.1] as [number, number, number],
  rotation: [0, Math.PI / 2, 0] as [number, number, number],
  scale: [0.45, 0.32, 0.05] as [number, number, number],
};
