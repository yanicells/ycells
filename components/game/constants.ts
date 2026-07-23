/** Arena half-extent on X/Z (playable floor is ARENA_SIZE * 2). */
export const ARENA_SIZE = 22;

export const MAX_SPEED = 8.5;
export const ACCEL = 28;
export const FRICTION = 18;

export const PLAYER_RADIUS = 0.72;
export const PLAYER_HEIGHT = 4.4;

/** Soft elevated follow camera — framed for a tall Sahur in a wide arena. */
export const CAMERA_POS: [number, number, number] = [0, 16, 22];
export const CAMERA_TARGET: [number, number, number] = [0, 1.2, 0];

/** Soft-void palette shared by arena + shell. */
export const VOID_BG = "#0e0f14";
export const VOID_FOG = "#12131a";
export const FLOOR = "#1c1e28";
export const FLOOR_LINE = "#3a3848";
export const RIM = "#d4b896";
