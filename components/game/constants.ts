/** Arena half-extent on X/Z (playable floor is ARENA_SIZE * 2). */
export const ARENA_SIZE = 36;

export const MAX_SPEED = 8.5;
export const ACCEL = 28;
export const FRICTION = 18;

export const PLAYER_RADIUS = 1.15;
export const PLAYER_HEIGHT = 7.2;

/** Soft elevated follow camera — framed for a tall Sahur in a wide arena. */
export const CAMERA_POS: [number, number, number] = [0, 18, 26];
export const CAMERA_TARGET: [number, number, number] = [0, 2.2, 0];

/** Soft-void palette shared by arena + shell — charcoal-blue slate, readable floor. */
export const VOID_BG = "#161822";
export const VOID_FOG = "#1a1c28";
export const FLOOR = "#303448";
export const FLOOR_LINE = "#5a5870";
export const RIM = "#e4c8a0";
