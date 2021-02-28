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

  constructor(private player: Player,
    private tileMap: Phaser.Tilemaps.Tilemap) {}

  public movePlayer(direction: Direction): void {
    if (this.isMoving()) return;
    if (this.isBlockingDirection(direction)) {
      this.player.setStandingFrame(direction);
    } else {
      this.startMoving(direction);
    }
  }

  public update(delta: number): void {
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

  private tilePosInDirection(direction: Direction): Vector2 {
    return this.player
      .getTilePos()
      .add(this.movementDirectionVectors[direction]);
  }

  private isBlockingDirection(direction: Direction): boolean {
    return this.hasBlockingTile(this.tilePosInDirection(direction));
  }

  private hasNoTile(pos: Vector2): boolean {
    return !this.tileMap.layers.some((layer) =>
      this.tileMap.hasTileAt(pos.x, pos.y, layer.name)
    );
  }

  private hasBlockingTile(pos: Vector2): boolean {
    if (this.hasNoTile(pos)) return true;
    return this.tileMap.layers.some((layer) => {
      const tile = this.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }
}
