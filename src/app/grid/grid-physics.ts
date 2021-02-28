import { GameConfiguration } from './../game/game-configuration';
import { Player } from '../player/player';
import { Direction } from './../player/direction.enum';
const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

export class GridPhysics {

  private movementDirection = Direction.NONE;
  private readonly speedPixelsPerSecond: number = GameConfiguration.TILE_SIZE * 3;
  private tileSizePixelsWalked: number = 0;
  private decimalPlacesLeft = 0;

  constructor(private player: Player) {}

  movePlayer(direction: Direction): void {
    if (!this.isMoving()) {
      this.startMoving(direction);
    }
  }

  update(delta: number): void {
    if (this.isMoving()) {
        this.updatePlayerPosition(delta);
    }
  }

  private updatePlayerPosition(delta: number) {
    this.decimalPlacesLeft = this.getDecimalPlaces(
      this.getSpeedPerDelta(delta) + this.decimalPlacesLeft
    );

    const pixelsToWalkThisUpdate = this.getIntegerPart(
      this.getSpeedPerDelta(delta) + this.decimalPlacesLeft
    );

    if (this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
      this.movePlayerSpriteRestOfTile();
    } else {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
    }
  }
  
  private getSpeedPerDelta(delta: number): number {
    const deltaInSeconds = delta / 1000;
    return this.speedPixelsPerSecond * deltaInSeconds;
  }
  
  private getIntegerPart(float: number): number {
    return Math.floor(float);
  }

  private getDecimalPlaces(float: number): number {
    return float % 1;
  }

  private willCrossTileBorderThisUpdate(
    pixelsToWalkThisUpdate: number
  ): boolean {
    return (
      this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameConfiguration.TILE_SIZE
    );
  }

  private movePlayerSpriteRestOfTile() {
    this.movePlayerSprite(GameConfiguration.TILE_SIZE - this.tileSizePixelsWalked);
    this.stopMoving();
  }
  
  private isMoving(): boolean {
    return this.movementDirection != Direction.NONE;
  }

  private startMoving(direction: Direction): void {
    this.movementDirection = direction;
  }

  private stopMoving(): void {
    this.movementDirection = Direction.NONE;
  }

  private movementDirectionVectors: {
    [key in Direction]?: Vector2;
  } = {
    [Direction.UP]: Vector2.UP,
    [Direction.DOWN]: Vector2.DOWN,
    [Direction.LEFT]: Vector2.LEFT,
    [Direction.RIGHT]: Vector2.RIGHT,
  };
  
  private movePlayerSprite(speed): void {
    const newPlayerPos = this.player
      .getPosition()
      .add(this.movementDistance(speed));
    this.player.setPosition(newPlayerPos);
    this.tileSizePixelsWalked += speed;
    this.updatePlayerFrame(this.movementDirection, this.tileSizePixelsWalked);
    this.tileSizePixelsWalked %= GameConfiguration.TILE_SIZE;
  }

  private updatePlayerFrame(
    direction: Direction,
    tileSizePixelsWalked: number
  ): void {
    if (this.hasWalkedHalfATile(tileSizePixelsWalked)) {
      this.player.setStandingFrame(direction);
    } else {
      this.player.setWalkingFrame(direction);
    }
  }
  
  private hasWalkedHalfATile(tileSizePixelsWalked: number): boolean {
    return tileSizePixelsWalked > GameConfiguration.TILE_SIZE / 2;
  }
  
  private movementDistance(speed: number): Vector2 {
    return this.movementDirectionVectors[this.movementDirection]
      .clone()
      .multiply(new Vector2(speed));
  }
}
