import { LayerService } from './../services/layer-service';
import { Direction } from './../direction/direction.enum';
import { GameConfiguration } from './../game/game-configuration';
import { Player } from '../player/player';
import { DirectionMovement } from '../direction/direction-movement';
import { TileService } from '../services/tile-service';
import { GridPathfinder } from './grid-pathfinder';
import { Node } from '../interfaces';

export class GridPhysics {
  private readonly PIXELS_PER_SECOND: number = GameConfiguration.TILE_SIZE * 3;
  private movementDirection: Direction = Direction.NONE;
  private tileSizePixelsWalked: number = 0;
  private remnant = 0;
  private tile = new TileService();

  constructor(
    private player: Player,
    private tilemap: Phaser.Tilemaps.Tilemap,
    private gridPathfinder: GridPathfinder
  ) { }

  /**
   * If the player is not moving yet and if the player is not blocked by an obstacle,
   * the player turns towards the direction indicated.
   *
   * @param direction The direction in which the player should be turned.
   */
  turnPlayerInWalkingDirection(direction: Direction): boolean {
    if (this.movementDirection != Direction.NONE) {
      return false;
    }

    if (this.tile.hasBlockingTile(this.tilemap, this.tile.getTilePositionInDirection(this.player, direction))) {
      this.player.setStandingFrame(direction);
    } else {
      this.movementDirection = direction;
    }

    LayerService.updateLayers(this.tilemap, this.player);

    return true;
  }

  /**
   * Moves the player to a random tile on the board.
   */
  movePlayerToRandomPlace() {
    console.log('Space pressed');
  }

  /**
   * If the player has been positioned towards a given direction,
   * moves the player in that direction.
   * @param delta The time in milliseconds.
   */
  update(delta: number): void {
    if (this.movementDirection != Direction.NONE) {
      this.updatePlayerPosition(delta);
    }
  }

  /**
   * Updates the player position.
   *
   * @param delta The time passed in milliseconds.
   */
  private updatePlayerPosition(delta: number) {
    this.remnant = (this.getDistancePerDelta(delta) + this.remnant) % 1;

    const pixelsToWalkThisUpdate = Math.floor(
      this.getDistancePerDelta(delta) + this.remnant
    );

    if (this.tile.willCrossTileBorderThisUpdate(this.tileSizePixelsWalked, pixelsToWalkThisUpdate)) {
      this.movePlayerSpriteRestOfTile();
    } else {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
    }
  }

  /**
   * Calculates the speed for the whole delta.
   *
   * @param delta The time passed in milliseconds.
   */
  private getDistancePerDelta(delta: number): number {
    const deltaInSeconds = delta / 1000;
    return this.PIXELS_PER_SECOND * deltaInSeconds;
  }


  /**
   * Moves the player for the rest of the tile.
   */
  private movePlayerSpriteRestOfTile() {
    this.movePlayerSprite(
      GameConfiguration.TILE_SIZE - this.tileSizePixelsWalked
    );
    this.movementDirection = Direction.NONE;
    const newTilePosition: Phaser.Math.Vector2 = this.player.getTilePosition();
    
    TileService.updateTileCost(this.tilemap, this.gridPathfinder, { x: newTilePosition.x, y: newTilePosition.y }, -5, false);
  }

  /**
   * Moves the player.
   *
   * @param pixels
   */
  private movePlayerSprite(pixels): void {
    this.player.setPosition(this.player
      .getPosition()
      .add(this.movementDistance(pixels)));
    this.tileSizePixelsWalked += pixels;
    this.updatePlayerFrame(this.movementDirection, this.tileSizePixelsWalked);
    this.tileSizePixelsWalked %= GameConfiguration.TILE_SIZE;
  }

  /**
   * Updates the player frame.
   *
   * @param direction The direction in which the player is walking.
   * @param numberOfPixelsWalkedOnThisTile The
   */
  private updatePlayerFrame(
    direction: Direction,
    numberOfPixelsWalkedOnThisTile: number
  ): void {
    if (this.tile.hasWalkedHalfATile(numberOfPixelsWalkedOnThisTile)) {
      this.player.setStandingFrame(direction);
    } else {
      this.player.setWalkingFrame(direction);
    }
  }

  /**
   * Returns the distance to be travelled with the given speed.
   *
   * @param speed The given speed.
   */
  private movementDistance(speed: number): Phaser.Math.Vector2 {
    return DirectionMovement.VECTORS[this.movementDirection]
      .clone()
      .multiply(new Phaser.Math.Vector2(speed));
  }

}

