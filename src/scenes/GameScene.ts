import Phaser from "phaser";
import {
  MAP_DATA,
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE_SIZE,
  TILE_TYPES,
  COLLISION_TILES,
} from "../data/map";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private collisionLayer!: Phaser.Physics.Arcade.StaticGroup;
  private moveSpeed = 150;
  private currentDirection = "down";

  constructor() {
    super({ key: "GameScene" });
  }

  create() {
    // Create player animations
    this.createAnimations();

    // Create the tilemap
    this.createTilemap();

    // Create player
    this.createPlayer();

    // Setup camera
    const worldWidth = MAP_WIDTH * TILE_SIZE;
    const worldHeight = MAP_HEIGHT * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Setup controls
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Add collision between player and collision layer
    this.physics.add.collider(this.player, this.collisionLayer);

    // Add UI text
    this.add
      .text(16, 16, "Use WASD or Arrow Keys to explore!", {
        font: "14px monospace",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(10000);

    // Add coordinates display
    const coordsText = this.add
      .text(16, 42, "", {
        font: "12px monospace",
        color: "#00ff88",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(10000);

    // Update coordinates text every frame
    this.events.on("update", () => {
      const tileX = Math.floor(this.player.x / TILE_SIZE);
      const tileY = Math.floor(this.player.y / TILE_SIZE);
      coordsText.setText(`Tile: (${tileX}, ${tileY})`);
    });
  }

  createAnimations() {
    // Down animation
    this.anims.create({
      key: "walk_down",
      frames: [{ key: "player_down_1" }, { key: "player_down_2" }],
      frameRate: 8,
      repeat: -1,
    });

    // Up animation
    this.anims.create({
      key: "walk_up",
      frames: [{ key: "player_up_1" }, { key: "player_up_2" }],
      frameRate: 8,
      repeat: -1,
    });

    // Left animation
    this.anims.create({
      key: "walk_left",
      frames: [{ key: "player_left_1" }, { key: "player_left_2" }],
      frameRate: 8,
      repeat: -1,
    });

    // Right animation
    this.anims.create({
      key: "walk_right",
      frames: [{ key: "player_right_1" }, { key: "player_right_2" }],
      frameRate: 8,
      repeat: -1,
    });

    // Idle animations (just first frame of each direction)
    this.anims.create({
      key: "idle_down",
      frames: [{ key: "player_down_1" }],
      frameRate: 1,
    });

    this.anims.create({
      key: "idle_up",
      frames: [{ key: "player_up_1" }],
      frameRate: 1,
    });

    this.anims.create({
      key: "idle_left",
      frames: [{ key: "player_left_1" }],
      frameRate: 1,
    });

    this.anims.create({
      key: "idle_right",
      frames: [{ key: "player_right_1" }],
      frameRate: 1,
    });
  }

  createTilemap() {
    // Create collision layer group
    this.collisionLayer = this.physics.add.staticGroup();

    // Map tile type to texture key
    const tileTextures: Record<number, string> = {
      [TILE_TYPES.GRASS]: "tile_grass",
      [TILE_TYPES.WATER]: "tile_water",
      [TILE_TYPES.SAND]: "tile_sand",
      [TILE_TYPES.EARTH]: "tile_earth",
      [TILE_TYPES.WALL]: "tile_wall",
      [TILE_TYPES.TREE]: "tile_tree",
    };

    // Render the map
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tileType = MAP_DATA[y][x];
        const textureKey = tileTextures[tileType];

        const posX = x * TILE_SIZE + TILE_SIZE / 2;
        const posY = y * TILE_SIZE + TILE_SIZE / 2;

        // For trees, first place grass underneath
        if (tileType === TILE_TYPES.TREE) {
          this.add.image(posX, posY, "tile_grass").setDepth(0);
        }

        // Create the tile
        const tile = this.add.image(posX, posY, textureKey);

        // Set depth - trees should be above player when player is above them
        if (tileType === TILE_TYPES.TREE) {
          tile.setDepth(posY + TILE_SIZE);
        } else {
          tile.setDepth(0);
        }

        // Add collision for blocking tiles
        if (COLLISION_TILES.includes(tileType)) {
          const collider = this.collisionLayer.create(posX, posY, textureKey);
          collider.setVisible(false); // Hide the collision sprite (we already have the visual tile)
          collider.body.setSize(TILE_SIZE, TILE_SIZE);
          collider.refreshBody();
        }
      }
    }
  }

  createPlayer() {
    // Find a valid starting position (first grass tile from center)
    let startX = Math.floor(MAP_WIDTH / 2);
    let startY = Math.floor(MAP_HEIGHT / 2);

    // Make sure we start on a walkable tile
    while (COLLISION_TILES.includes(MAP_DATA[startY][startX])) {
      startX++;
      if (startX >= MAP_WIDTH - 1) {
        startX = 1;
        startY++;
      }
    }

    const posX = startX * TILE_SIZE + TILE_SIZE / 2;
    const posY = startY * TILE_SIZE + TILE_SIZE / 2;

    this.player = this.physics.add.sprite(posX, posY, "player_down_1");
    this.player.setScale(1.5);
    this.player.setDepth(posY);

    // Set up player physics body
    this.player.body!.setSize(12, 12);
    this.player.body!.setOffset(2, 4);
  }

  update() {
    // Reset velocity
    this.player.setVelocity(0);

    // Handle movement
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -this.moveSpeed;
      this.currentDirection = "left";
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = this.moveSpeed;
      this.currentDirection = "right";
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -this.moveSpeed;
      if (!isMoving) this.currentDirection = "up";
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = this.moveSpeed;
      if (!isMoving) this.currentDirection = "down";
      isMoving = true;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.setVelocity(velocityX, velocityY);

    // Play appropriate animation
    if (isMoving) {
      this.player.anims.play(`walk_${this.currentDirection}`, true);
    } else {
      this.player.anims.play(`idle_${this.currentDirection}`, true);
    }

    // Update player depth based on Y position for proper layering with trees
    this.player.setDepth(this.player.y);
  }
}
