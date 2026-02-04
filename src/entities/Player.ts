import Phaser from "phaser";
import { GameConfig } from "../config/GameConfig";

type Direction = "up" | "down" | "left" | "right";

export class Player {
  private scene: Phaser.Scene;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private currentDirection: Direction = "down";
  private moveSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.moveSpeed = GameConfig.player.moveSpeed;

    // Create sprite
    this.sprite = scene.physics.add.sprite(x, y, "player_down_1");
    this.sprite.setScale(GameConfig.player.scale);

    // Calculate body dimensions based on scaled sprite size
    const scaledWidth = this.sprite.width * GameConfig.player.scale;
    const scaledHeight = this.sprite.height * GameConfig.player.scale;
    const bodyWidth = scaledWidth * GameConfig.player.bodyWidthRatio;
    const bodyHeight = scaledHeight * GameConfig.player.bodyHeightRatio;
    const offsetX = scaledWidth * GameConfig.player.bodyOffsetXRatio;
    const offsetY = scaledHeight * GameConfig.player.bodyOffsetYRatio;

    // Set up physics body
    this.sprite.body!.setSize(bodyWidth, bodyHeight);
    this.sprite.body!.setOffset(offsetX, offsetY);

    // Setup controls
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Create animations
    this.createAnimations();
  }

  private createAnimations(): void {
    const directions: Direction[] = ["down", "up", "left", "right"];

    directions.forEach((dir) => {
      // Walking animation
      this.scene.anims.create({
        key: `walk_${dir}`,
        frames: [{ key: `player_${dir}_1` }, { key: `player_${dir}_2` }],
        frameRate: 8,
        repeat: -1,
      });

      // Idle animation
      this.scene.anims.create({
        key: `idle_${dir}`,
        frames: [{ key: `player_${dir}_1` }],
        frameRate: 1,
      });
    });
  }

  public update(): void {
    // Reset velocity
    this.sprite.setVelocity(0);

    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;

    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -this.moveSpeed;
      this.currentDirection = "left";
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = this.moveSpeed;
      this.currentDirection = "right";
      isMoving = true;
    }

    // Vertical movement
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

    this.sprite.setVelocity(velocityX, velocityY);

    // Play animation
    const animKey = isMoving
      ? `walk_${this.currentDirection}`
      : `idle_${this.currentDirection}`;
    this.sprite.anims.play(animKey, true);

    // Update depth for proper layering
    this.sprite.setDepth(this.sprite.y);
  }

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public setCollidesWith(
    group: Phaser.Physics.Arcade.StaticGroup,
  ): Phaser.Physics.Arcade.Collider {
    return this.scene.physics.add.collider(this.sprite, group);
  }
}
