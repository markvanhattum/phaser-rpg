import { Direction } from './../direction/direction.enum';
import { GameConfiguration } from './../game/game-configuration';
import { Player } from '../player/player';
import { MovementDirection } from '../direction/movement-direction';

export class GridPhysics {
  private readonly PIXELS_PER_SECOND: number = GameConfiguration.TILE_SIZE * 3;
  private readonly GROUND: string = 'Ground';
  private readonly DISTANCE_FROM_PLAYER: number = 20;
  private movementDirection: Direction = Direction.NONE;
  private tileSizePixelsWalked: number = 0;
  private remnant = 0;

  constructor(
    private player: Player,
    private tileMap: Phaser.Tilemaps.Tilemap
  ) { }

  /**
   * If the player is not moving yet and if the player is not blocked by an obstacle,
   * the player turns towards the direction indicated.
   *
   * @param direction The direction in which the player should be turned.
   */
  public movePlayer(direction: Direction): void {
    if (this.hasADirection()) return;

    if (this.isBlockingDirection(direction)) {
      this.player.setStandingFrame(direction);
    } else {
      this.setPlayerDirection(direction);
    }

    this.updateLayers();
  }

  private updateLayers() {
    let backgroundTiles: Phaser.Tilemaps.Tile[] = [];
    let foregroundTiles: Phaser.Tilemaps.Tile[] = [];

    this.tileMap.layers.forEach((layer) => {
      if (layer.name === this.GROUND) {
        return;
      }
      backgroundTiles = this.addTiles(backgroundTiles, layer, -this.DISTANCE_FROM_PLAYER, tile => tile.y <= this.player.getTilePosition().y);
      foregroundTiles = this.addTiles(foregroundTiles, layer, 1, tile => tile.y > this.player.getTilePosition().y);
    });

    let backgroundLayers: Array<Phaser.Tilemaps.LayerData> = this.getLayersFromTiles(backgroundTiles);
    let foregroundLayers: Array<Phaser.Tilemaps.LayerData> = this.getLayersFromTiles(foregroundTiles);

    const maxBackgroundLayer: Phaser.Tilemaps.LayerData = this.getOneLayer(backgroundLayers, true);
    const minForegroundLayer: Phaser.Tilemaps.LayerData = this.getOneLayer(foregroundLayers, false);

    this.player.setPlayerLayer(maxBackgroundLayer.tilemapLayer.depth + 1);

    const delta = this.player.getPlayerLayer() + 1 - minForegroundLayer.tilemapLayer.depth;
    foregroundLayers.forEach(layer => {
      layer.tilemapLayer.depth = layer.tilemapLayer.depth + delta;
    });
  }

  private addTiles(tiles: Phaser.Tilemaps.Tile[], layer: Phaser.Tilemaps.LayerData, deltaY: number, predicate): Phaser.Tilemaps.Tile[] {
    return tiles.concat(this.tileMap.getTilesWithin(
      this.player.getTilePosition().x - this.DISTANCE_FROM_PLAYER,
      this.player.getTilePosition().y + deltaY,
      2 * this.DISTANCE_FROM_PLAYER,
      this.DISTANCE_FROM_PLAYER, null, layer.name)
      .filter(predicate)
      .filter(tile => tile.properties.collides));
  }

  private getLayersFromTiles(tiles: Phaser.Tilemaps.Tile[]): Phaser.Tilemaps.LayerData[] {
    let layers: Phaser.Tilemaps.LayerData[] = tiles.map(tile => tile.layer);
    return layers.filter((layer, index) => layers.indexOf(layer) === index);
  }

  private getOneLayer(layers: Phaser.Tilemaps.LayerData[], max: boolean): Phaser.Tilemaps.LayerData {
    return layers.length == 0 ? this.tileMap.getLayer(this.GROUND) : layers.reduce(
      function (minMax, current) {
        if (max) {
          return minMax.tilemapLayer.depth > current.tilemapLayer.depth ? minMax : current;
        } else {
          return minMax.tilemapLayer.depth < current.tilemapLayer.depth ? minMax : current;
        }
      });
  }

  /**
   * Moves the player to a random tile on the board.
   */
  public movePlayerToRandomPlace() {
    console.log('Space pressed');
  }

  /**
   * If the player has been positioned towards a given direction,
   * moves the player in that direction.
   * @param delta The time in milliseconds.
   */
  public update(delta: number): void {
    if (this.hasADirection()) {
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

    if (this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
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
   * Returns whether this update the player will cross the tile border.
   *
   * @param pixelsToWalkThisUpdate Number of pixels to walk this update.
   */
  private willCrossTileBorderThisUpdate(
    pixelsToWalkThisUpdate: number
  ): boolean {
    return (
      this.tileSizePixelsWalked + pixelsToWalkThisUpdate >=
      GameConfiguration.TILE_SIZE
    );
  }

  /**
   * Moves the player for the rest of the tile.
   */
  private movePlayerSpriteRestOfTile() {
    this.movePlayerSprite(
      GameConfiguration.TILE_SIZE - this.tileSizePixelsWalked
    );
    this.resetPlayerDirection();
  }

  /**
   * True if the player faces a direction.
   */
  private hasADirection(): boolean {
    return this.movementDirection != Direction.NONE;
  }

  /**
   * Sets the player direction.
   *
   * @param direction The direction in which the player should be set.
   */
  private setPlayerDirection(direction: Direction): void {
    this.movementDirection = direction;
  }

  /**
   * Resets the player direction.
   */
  private resetPlayerDirection(): void {
    this.movementDirection = Direction.NONE;
  }

  /**
   * Moves the player.
   *
   * @param speed
   */
  private movePlayerSprite(speed): void {
    const newPlayerPos = this.player
      .getPosition()
      .add(this.movementDistance(speed));
    this.player.setPosition(newPlayerPos);
    this.tileSizePixelsWalked += speed;
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
    if (this.hasWalkedHalfATile(numberOfPixelsWalkedOnThisTile)) {
      this.player.setStandingFrame(direction);
    } else {
      this.player.setWalkingFrame(direction);
    }
  }

  private hasWalkedHalfATile(numberOfPixelsWalkedOnThisTile: number): boolean {
    return numberOfPixelsWalkedOnThisTile > GameConfiguration.TILE_SIZE / 2;
  }

  /**
   * Returns the distance to be travelled with the given speed.
   *
   * @param speed The given speed.
   */
  private movementDistance(speed: number): Phaser.Math.Vector2 {
    return MovementDirection.VECTORS[this.movementDirection]
      .clone()
      .multiply(new Phaser.Math.Vector2(speed));
  }

  /**
   * Returns the position of the next tile in the given direction.
   *
   * @param direction The given direction.
   */
  private getTilePositionInDirection(
    direction: Direction
  ): Phaser.Math.Vector2 {
    return this.player
      .getTilePosition()
      .add(MovementDirection.VECTORS[direction]);
  }

  /**
   * Returns whether the next tile in the given direction is a blocking tile.
   *
   * @param direction The given direction.
   */
  private isBlockingDirection(direction: Direction): boolean {
    return this.hasBlockingTile(this.getTilePositionInDirection(direction));
  }

  /**
   * Returns whether the given position contains a tile.
   *
   * @param position The given position.
   */
  private hasATile(position: Phaser.Math.Vector2): boolean {
    return this.tileMap.layers.some((layer) =>
      this.tileMap.hasTileAt(position.x, position.y, layer.name)
    );
  }

  /**
   * Returns whether the given position containts a blocking tile.
   *
   * @param position The given position.
   */
  private hasBlockingTile(position: Phaser.Math.Vector2): boolean {
    if (!this.hasATile(position)) {
      return true;
    }
    return this.tileMap.layers.some((layer) => {
      const tile = this.getTileAtPosition(position, layer);
      return tile && tile.properties.collides;
    });
  }

  private getTileAtPosition(position: Phaser.Math.Vector2, layer: Phaser.Tilemaps.LayerData): Phaser.Tilemaps.Tile {
    return this.tileMap.getTileAt(position.x, position.y, false, layer.name);
  }
}

