/** Arena half-extent on X/Z (playable floor is ARENA_SIZE * 2). */
export const ARENA_SIZE = 36;

export const MAX_SPEED = 8.5;
export const ACCEL = 28;
export const FRICTION = 18;

export const PLAYER_RADIUS = 0.95;
export const PLAYER_HEIGHT = 5.8;

/** Soft elevated follow camera — framed for a tall Sahur in a wide arena. */
export const CAMERA_POS: [number, number, number] = [0, 9.5, 13.5];
export const CAMERA_TARGET: [number, number, number] = [0, 1.8, 0];

/** Soft-void palette shared by arena + shell. */
export const VOID_BG = "#14161f";
export const VOID_FOG = "#181a24";
export const FLOOR = "#2a2d3a";
export const FLOOR_LINE = "#4e4c60";
export const RIM = "#e0c49c";
