import Phaser from "phaser";
import {
  TileType,
  TILE_SIZE,
  TILE_SCALE,
  TILE_TEXTURES,
  isCollidable,
} from "../config/TileConfig";

export class TileMap {
  private scene: Phaser.Scene;
  private data: TileType[][] = [];
  private collisionGroup: Phaser.Physics.Arcade.StaticGroup;

  public width: number = 0;
  public height: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.collisionGroup = scene.physics.add.staticGroup();
  }

  public async loadFromFile(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(path)
        .then((response) => response.text())
        .then((text) => {
          this.parseMapData(text);
          resolve();
        })
        .catch(reject);
    });
  }

  private parseMapData(text: string): void {
    const lines = text.trim().split("\n");
    this.data = lines.map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((num) => parseInt(num, 10) as TileType),
    );
    this.height = this.data.length;
    this.width = this.data[0]?.length || 0;
  }

  public render(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.renderTile(x, y);
      }
    }
  }

  private renderTile(x: number, y: number): void {
    const tileType = this.data[y][x];
    const textureKey = TILE_TEXTURES[tileType];
    const posX = x * TILE_SIZE + TILE_SIZE / 2;
    const posY = y * TILE_SIZE + TILE_SIZE / 2;

    // For trees, place grass underneath
    if (tileType === TileType.TREE) {
      this.scene.add
        .image(posX, posY, TILE_TEXTURES[TileType.GRASS])
        .setScale(TILE_SCALE)
        .setDepth(0);
    }

    // Create the tile sprite
    const tile = this.scene.add
      .image(posX, posY, textureKey)
      .setScale(TILE_SCALE);

    // Set depth - trees should render above player when player is above them
    if (tileType === TileType.TREE) {
      tile.setDepth(posY + TILE_SIZE);
    } else {
      tile.setDepth(0);
    }

    // Add collision for blocking tiles
    if (isCollidable(tileType)) {
      const collider = this.collisionGroup.create(posX, posY, textureKey);
      collider.setVisible(false);
      collider.body.setSize(TILE_SIZE, TILE_SIZE);
      collider.refreshBody();
    }
  }

  public getTileAt(x: number, y: number): TileType | null {
    if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
      return this.data[y][x];
    }
    return null;
  }

  public isWalkable(x: number, y: number): boolean {
    const tile = this.getTileAt(x, y);
    return tile !== null && !isCollidable(tile);
  }

  public getCollisionGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.collisionGroup;
  }

  public getWorldWidth(): number {
    return this.width * TILE_SIZE;
  }

  public getWorldHeight(): number {
    return this.height * TILE_SIZE;
  }

  public findSpawnPoint(): { x: number; y: number } {
    // Start from center and find first walkable tile
    let startX = Math.floor(this.width / 2);
    let startY = Math.floor(this.height / 2);

    while (!this.isWalkable(startX, startY)) {
      startX++;
      if (startX >= this.width - 1) {
        startX = 1;
        startY++;
      }
      if (startY >= this.height) {
        startY = 1;
        startX = 1;
      }
    }

    return {
      x: startX * TILE_SIZE + TILE_SIZE / 2,
      y: startY * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
