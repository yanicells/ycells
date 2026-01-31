# yCells - Copilot Instructions

## Project Overview

2D tile-based exploration game built with **Phaser 3** + **TypeScript** + **Vite**. No React/Next.js - pure Phaser game.

## Commands

```bash
pnpm dev      # Start dev server at localhost:3000
pnpm build    # Build for production
```

## Architecture

### Directory Structure

```
src/
├── config/        # Game constants (TileConfig.ts, GameConfig.ts)
├── entities/      # Game objects (Player.ts, TileMap.ts)
├── scenes/        # Phaser scenes (BootScene.ts, GameScene.ts)
├── ui/            # HUD components (GameUI.ts)
└── main.ts        # Phaser game config & entry point

public/
├── maps/          # Map data as .txt files (space-separated tile IDs)
├── player/        # Player sprite PNGs (boy_down_1.png, etc.)
└── tiles/         # 16x16 tile PNGs (grass.png, water.png, etc.)
```

### Key Patterns

**Tile System** - Tiles are 16x16 PNGs scaled 2x to 32px. Map files use space-separated numbers:

- `0`=grass, `1`=water, `2`=sand, `3`=earth, `4`=wall, `5`=tree
- Collision tiles defined in `TileConfig.ts`: water, wall, tree

**Entity Classes** - Wrap Phaser objects with OOP pattern:

```typescript
// Entities receive scene in constructor, expose getSprite() for physics
class Player {
  constructor(scene: Phaser.Scene, x: number, y: number) {}
  getSprite(): Phaser.Physics.Arcade.Sprite {}
  setCollidesWith(group: StaticGroup): Collider {}
}
```

**Scene Flow**: `BootScene` (loads assets) → `GameScene` (gameplay)

**Config Objects** - All magic numbers live in `src/config/`:

- `GameConfig.ts`: player speed, scale, camera settings
- `TileConfig.ts`: tile types enum, textures map, collision list

### Adding New Features

**New tile type**: Add to `TileType` enum, `TILE_TEXTURES` map, optionally `COLLISION_TILES` in `TileConfig.ts`. Add PNG to `public/tiles/`.

**New entity**: Create class in `src/entities/`, inject `Phaser.Scene`, handle own sprite/physics. Instantiate in `GameScene.create()`.

**Edit map**: Modify `public/maps/world.txt` - each row is one tile row, space-separated tile IDs.

## Conventions

- Sprites use `setScale(2)` for pixel-art crisp scaling
- Depth sorting: tiles at 0, player at Y position, trees at Y+TILE_SIZE, UI at 10000
- Player animations: `walk_${direction}` and `idle_${direction}` keys
