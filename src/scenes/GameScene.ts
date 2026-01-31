import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private worldWidth = 2048;
  private worldHeight = 2048;
  private moveSpeed = 200;

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Create the tiled grass background
    this.createBackground();

    // Create world objects (trees, rocks, houses, flowers)
    this.createWorldObjects();

    // Create player
    this.createPlayer();

    // Setup camera
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Add UI text
    this.add
      .text(16, 16, "Use WASD or Arrow Keys to explore!", {
        font: "18px monospace",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Add coordinates display
    const coordsText = this.add
      .text(16, 50, "", {
        font: "14px monospace",
        color: "#00ff88",
        backgroundColor: "#000000",
        padding: { x: 10, y: 5 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    // Update coordinates text every frame
    this.events.on("update", () => {
      coordsText.setText(
        `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      );
    });
  }

  createBackground() {
    // Create a tiled grass background
    for (let x = 0; x < this.worldWidth; x += 64) {
      for (let y = 0; y < this.worldHeight; y += 64) {
        const grass = this.add.image(x + 32, y + 32, "grass");
        grass.setDepth(0);
        // Add slight color variation for visual interest
        if (Math.random() > 0.7) {
          grass.setTint(0x5a9c6a);
        }
      }
    }
  }

  createWorldObjects() {
    // Create scattered trees
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(100, this.worldWidth - 100);
      const y = Phaser.Math.Between(100, this.worldHeight - 100);
      const tree = this.add.image(x, y, "tree");
      tree.setDepth(y); // Depth sorting based on Y position
    }

    // Create scattered rocks
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(50, this.worldWidth - 50);
      const y = Phaser.Math.Between(50, this.worldHeight - 50);
      const rock = this.add.image(x, y, "rock");
      rock.setDepth(y);
      rock.setScale(0.8 + Math.random() * 0.4);
    }

    // Create some houses in clusters
    const housePositions = [
      { x: 300, y: 300 },
      { x: 500, y: 350 },
      { x: 1500, y: 800 },
      { x: 1600, y: 900 },
      { x: 800, y: 1500 },
      { x: 1800, y: 400 },
    ];

    housePositions.forEach((pos) => {
      const house = this.add.image(pos.x, pos.y, "house");
      house.setDepth(pos.y);
    });

    // Create flower patches
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(50, this.worldWidth - 50);
      const y = Phaser.Math.Between(50, this.worldHeight - 50);
      const flower = this.add.image(x, y, "flower");
      flower.setDepth(y);
      // Random flower colors
      const colors = [0xff69b4, 0xff6347, 0xffd700, 0x9370db, 0x00ced1];
      flower.setTint(colors[Math.floor(Math.random() * colors.length)]);
    }
  }

  createPlayer() {
    // Start player in the center of the world
    this.player = this.physics.add.sprite(
      this.worldWidth / 2,
      this.worldHeight / 2,
      "player",
    );
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(1000); // Player always on top for now
  }

  update() {
    // Reset velocity
    this.player.setVelocity(0);

    // Handle movement
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -this.moveSpeed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = this.moveSpeed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -this.moveSpeed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = this.moveSpeed;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Update player depth based on Y position for proper layering
    this.player.setDepth(this.player.y);
  }
}
