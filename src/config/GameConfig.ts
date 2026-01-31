// Game configuration constants
export const GameConfig = {
  player: {
    moveSpeed: 120,
    scale: 2,
    bodyWidth: 20,
    bodyHeight: 20,
    bodyOffsetX: 6,
    bodyOffsetY: 12,
  },
  camera: {
    zoom: 2,
    lerpX: 0.1,
    lerpY: 0.1,
  },
  ui: {
    fontSize: 14,
    padding: 8,
    depth: 10000,
  },
} as const;
