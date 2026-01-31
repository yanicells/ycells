import Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";
import { TILE_SIZE } from "../config/TileConfig";

export class GameUI {
  private scene: Phaser.Scene;
  private coordsText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Instructions text
    this.scene.add
      .text(16, 16, "Use WASD or Arrow Keys to explore!", {
        font: `${GameConfig.ui.fontSize}px monospace`,
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: GameConfig.ui.padding, y: GameConfig.ui.padding / 2 },
      })
      .setScrollFactor(0)
      .setDepth(GameConfig.ui.depth);

    // Coordinates text
    this.coordsText = this.scene.add
      .text(16, 42, "", {
        font: `${GameConfig.ui.fontSize - 2}px monospace`,
        color: "#00ff88",
        backgroundColor: "#000000",
        padding: { x: GameConfig.ui.padding, y: GameConfig.ui.padding / 2 },
      })
      .setScrollFactor(0)
      .setDepth(GameConfig.ui.depth);
  }

  public updateCoords(x: number, y: number): void {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    this.coordsText.setText(`Tile: (${tileX}, ${tileY})`);
  }
}
