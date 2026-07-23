/** Arena half-extent on X/Z (playable floor is ARENA_SIZE * 2). */
export const ARENA_SIZE = 36;

export const MAX_SPEED = 10.5;
export const ACCEL = 30;
export const FRICTION = 18;

export const PLAYER_RADIUS = 1.15;
export const PLAYER_HEIGHT = 7.2;

/** Soft elevated follow camera — close enough that Sahur fills the frame. */
export const CAMERA_POS: [number, number, number] = [0, 9.2, 12.5];
export const CAMERA_TARGET: [number, number, number] = [0, 2.6, 0];

/** Soft-void palette shared by arena + shell — charcoal-blue slate, readable floor. */
export const VOID_BG = "#1a1c28";
export const VOID_FOG = "#1e2030";
export const FLOOR = "#3a3e52";
export const FLOOR_LINE = "#6a6880";
export const RIM = "#e8d0a8";
