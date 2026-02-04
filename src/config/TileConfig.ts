// Tile configuration constants
/** Base tile size in pixels - must match actual tile image dimensions */
export const TILE_SIZE = 16;
/** Visual scale multiplier for tiles */
export const TILE_SCALE = 4;
/** The actual rendered size of a tile (TILE_SIZE * TILE_SCALE) */
export const SCALED_TILE_SIZE = TILE_SIZE * TILE_SCALE;

export enum TileType {
  GRASS = 0,
  WATER = 1,
  SAND = 2,
  EARTH = 3,
  WALL = 4,
  TREE = 5,
}

export const TILE_TEXTURES: Record<TileType, string> = {
  [TileType.GRASS]: "tile_grass",
  [TileType.WATER]: "tile_water",
  [TileType.SAND]: "tile_sand",
  [TileType.EARTH]: "tile_earth",
  [TileType.WALL]: "tile_wall",
  [TileType.TREE]: "tile_tree",
};

export const COLLISION_TILES: TileType[] = [
  TileType.WATER,
  TileType.WALL,
  TileType.TREE,
];

export function isCollidable(tileType: TileType): boolean {
  return COLLISION_TILES.includes(tileType);
}
