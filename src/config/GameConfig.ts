// Game configuration constants
export const GameConfig = {
  player: {
    moveSpeed: 200,
    /** Visual scale multiplier - should generally match TILE_SCALE */
    scale: 4,
    /** Body width as a fraction of sprite width (0-1) */
    bodyWidthRatio: 0.625,
    /** Body height as a fraction of sprite height (0-1) */
    bodyHeightRatio: 0.625,
    /** Body X offset as a fraction of sprite width (0-1) */
    bodyOffsetXRatio: 0.1875,
    /** Body Y offset as a fraction of sprite height (0-1) */
    bodyOffsetYRatio: 0.375,
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
