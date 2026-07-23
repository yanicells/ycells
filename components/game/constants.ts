/** Arena half-extent on X/Z (playable floor is ARENA_SIZE * 2). */
export const ARENA_SIZE = 36;

export const MAX_SPEED = 10.5;
export const ACCEL = 30;
export const FRICTION = 18;

export const PLAYER_RADIUS = 1.15;
export const PLAYER_HEIGHT = 7.2;

/** Soft elevated follow camera — full Sahur in frame with room to read the floor. */
export const CAMERA_POS: [number, number, number] = [0, 12.5, 17];
export const CAMERA_TARGET: [number, number, number] = [0, 3.4, 0];

/** Soft-void palette shared by arena + shell — charcoal-blue slate, readable floor. */
export const VOID_BG = "#1c1e2c";
export const VOID_FOG = "#222438";
export const FLOOR = "#454a62";
export const FLOOR_LINE = "#7a7894";
export const RIM = "#ecd8b0";
