import Phaser from "phaser";
import { Player } from "../entities/Player";
import { TileMap } from "../entities/TileMap";
import { GameUI } from "../ui/GameUI";
import { GameConfig } from "../config/GameConfig";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private tileMap!: TileMap;
  private ui!: GameUI;

  constructor() {
    super({ key: "GameScene" });
  }

  async create(): Promise<void> {
    // Create and load tilemap
    this.tileMap = new TileMap(this);
    await this.tileMap.loadFromFile("/maps/world.txt");
    this.tileMap.render();

    // Create player at spawn point
    const spawn = this.tileMap.findSpawnPoint();
    this.player = new Player(this, spawn.x, spawn.y);

    // Set up collision
    this.player.setCollidesWith(this.tileMap.getCollisionGroup());

    // Setup camera
    this.setupCamera();

    // Create UI
    this.ui = new GameUI(this);
  }

  private setupCamera(): void {
    const { zoom, lerpX, lerpY } = GameConfig.camera;

    this.cameras.main.setBounds(
      0,
      0,
      this.tileMap.getWorldWidth(),
      this.tileMap.getWorldHeight(),
    );
    this.cameras.main.startFollow(this.player.getSprite(), true, lerpX, lerpY);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.setRoundPixels(true);
  }

  update(): void {
    if (this.player) {
      this.player.update();

      // Update UI
      const pos = this.player.getPosition();
      this.ui.updateCoords(pos.x, pos.y);
    }
  }
}
