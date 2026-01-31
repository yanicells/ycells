import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // Create a loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(
      width / 2,
      height / 2 - 50,
      "Loading...",
      {
        font: "20px monospace",
        color: "#ffffff",
      },
    );
    loadingText.setOrigin(0.5, 0.5);

    // Update progress bar as assets load
    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff88, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load tile images
    this.load.image("tile_grass", "/tiles/grass.png");
    this.load.image("tile_water", "/tiles/water.png");
    this.load.image("tile_sand", "/tiles/sand.png");
    this.load.image("tile_earth", "/tiles/earth.png");
    this.load.image("tile_wall", "/tiles/wall.png");
    this.load.image("tile_tree", "/tiles/tree.png");

    // Load player sprites
    this.load.image("player_down_1", "/player/boy_down_1.png");
    this.load.image("player_down_2", "/player/boy_down_2.png");
    this.load.image("player_up_1", "/player/boy_up_1.png");
    this.load.image("player_up_2", "/player/boy_up_2.png");
    this.load.image("player_left_1", "/player/boy_left_1.png");
    this.load.image("player_left_2", "/player/boy_left_2.png");
    this.load.image("player_right_1", "/player/boy_right_1.png");
    this.load.image("player_right_2", "/player/boy_right_2.png");
  }

  create() {
    this.scene.start("GameScene");
  }
}
