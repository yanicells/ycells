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

    // Generate placeholder sprites (you'll replace these with your images)
    this.createPlaceholderSprites();

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

  createPlaceholderSprites() {
    // Create ground/grass tiles
    const grassGraphics = this.make.graphics({ x: 0, y: 0 });
    grassGraphics.fillStyle(0x4a7c59, 1);
    grassGraphics.fillRect(0, 0, 64, 64);
    grassGraphics.fillStyle(0x5a8c69, 1);
    grassGraphics.fillRect(8, 8, 8, 8);
    grassGraphics.fillRect(40, 24, 8, 8);
    grassGraphics.fillRect(24, 48, 8, 8);
    grassGraphics.generateTexture("grass", 64, 64);
    grassGraphics.destroy();

    // Create a tree sprite
    const treeGraphics = this.make.graphics({ x: 0, y: 0 });
    treeGraphics.fillStyle(0x8b4513, 1);
    treeGraphics.fillRect(24, 48, 16, 32);
    treeGraphics.fillStyle(0x228b22, 1);
    treeGraphics.fillCircle(32, 32, 28);
    treeGraphics.generateTexture("tree", 64, 80);
    treeGraphics.destroy();

    // Create a house sprite
    const houseGraphics = this.make.graphics({ x: 0, y: 0 });
    houseGraphics.fillStyle(0xcd853f, 1);
    houseGraphics.fillRect(8, 40, 80, 56);
    houseGraphics.fillStyle(0x8b0000, 1);
    houseGraphics.fillTriangle(48, 8, 8, 44, 88, 44);
    houseGraphics.fillStyle(0x654321, 1);
    houseGraphics.fillRect(36, 60, 24, 36);
    houseGraphics.generateTexture("house", 96, 96);
    houseGraphics.destroy();

    // Create a rock sprite
    const rockGraphics = this.make.graphics({ x: 0, y: 0 });
    rockGraphics.fillStyle(0x696969, 1);
    rockGraphics.fillEllipse(24, 20, 40, 32);
    rockGraphics.fillStyle(0x808080, 1);
    rockGraphics.fillEllipse(20, 16, 12, 10);
    rockGraphics.generateTexture("rock", 48, 40);
    rockGraphics.destroy();

    // Create a flower sprite
    const flowerGraphics = this.make.graphics({ x: 0, y: 0 });
    flowerGraphics.fillStyle(0x228b22, 1);
    flowerGraphics.fillRect(14, 16, 4, 16);
    flowerGraphics.fillStyle(0xff69b4, 1);
    flowerGraphics.fillCircle(16, 10, 8);
    flowerGraphics.fillStyle(0xffff00, 1);
    flowerGraphics.fillCircle(16, 10, 3);
    flowerGraphics.generateTexture("flower", 32, 32);
    flowerGraphics.destroy();
  }

  create() {
    this.scene.start("GameScene");
  }
}
