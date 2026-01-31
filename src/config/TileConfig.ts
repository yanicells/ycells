// Tile configuration constants
export const TILE_SIZE = 32;
export const TILE_SCALE = 2;

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
