// Camera — standing on grass behind the desk setup, looking inward
export const CAMERA_START_POSITION: [number, number, number] = [0, 1.7, 9];
export const EYE_HEIGHT = 1.7;

// Movement
export const MOVE_SPEED = 0.06;
export const SPRINT_MULTIPLIER = 2.0;

// Walkable bounds — open grass field
export const ROOM_BOUNDS = {
  minX: -15,
  maxX: 15,
  minZ: -20,
  maxZ: 12,
};

// ── Model positions ──────────────────────────────────────────────────────────
// All models placed in world space (grass at y = 0).
// Check console bounding-box logs on first load and tune as needed.
export const MODEL_CONFIG = {
  // Desk / table — scene focal point, centred
  table: {
    position: [0, 0, 0] as [number, number, number],
    scale: 1 as number,
    rotation: [0, 0, 0] as [number, number, number],
  },

  // Computer — placed on table surface.
  // y = 0.8 is a first guess for a ~80 cm desk; tune after seeing bounding-box log.
  computer: {
    position: [0, 0.8, -0.1] as [number, number, number],
    scale: 1 as number,
    rotation: [0, Math.PI, 0] as [number, number, number],
  },

  // Person — standing to the right of the table, slightly angled toward it
  people: {
    position: [1.6, 0, 0.4] as [number, number, number],
    scale: 1 as number,
    rotation: [0, -Math.PI * 0.65, 0] as [number, number, number],
  },

  // Flower — Anemone at the near-left table leg
  plant: {
    position: [-0.7, 0, 0.7] as [number, number, number],
    scale: 0.5 as number,
    rotation: [0, 0.4, 0] as [number, number, number],
  },

  // House — far behind and slightly to the right, visible as a landmark
  house: {
    position: [6, 0, -18] as [number, number, number],
    scale: 1 as number,
    rotation: [0, -Math.PI * 0.2, 0] as [number, number, number],
  },
};

// ── Computer-screen hotspot ──────────────────────────────────────────────────
// Invisible clickable box overlaid on the monitor screen.
// Tune position.y after checking the [ComputerModel] bounding-box log.
export const COMPUTER_HOTSPOT = {
  position: [0, 1.4, -0.15] as [number, number, number],
  rotation: [0, Math.PI, 0] as [number, number, number],
  scale: [0.5, 0.35, 0.05] as [number, number, number],
};
