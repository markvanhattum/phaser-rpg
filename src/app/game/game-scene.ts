import { MovementDirection } from './../direction/movement-direction';
import { GridControls } from "../grid/grid-controls";
import { GridPhysics } from "../grid/grid-physics";
import { Player } from "../player/player";
import { js as EasyStar } from "easystarjs";
import { GameConfiguration } from "./game-configuration";
import { Direction } from '../direction/direction.enum';

export class GameScene extends Phaser.Scene {
  private readonly TILESET_CITY: string = 'Cloud City';
  private readonly TILESET_GROUND: string = 'Cloud Ground';
  private readonly CLOUD_CITY_MAP: string = 'cloud-city-map';
  private readonly PLAYER: string = 'player';
  private readonly GROUND: string = 'Ground';
  private player: Player;
  private gridControls: GridControls;
  private gridPhysics: GridPhysics;
  private pathfinder: EasyStar;
  private acceptableTiles: number[] = [];
  private path: {
    x: number;
    y: number;
  }[];
  private iteration_path: number = 1;

  constructor() {
    super({ key: 'main' });
  }

  public preload() {
    this.load.image(this.TILESET_CITY, '../../assets/cloud_tileset.png');
    this.load.image(this.TILESET_GROUND, '../../assets/gridtiles.png');
    this.load.tilemapTiledJSON(this.CLOUD_CITY_MAP, '../../assets/cloud_city.json');

    this.load.spritesheet(this.PLAYER, "assets/characters.png", {
      frameWidth: Player.SPRITE_FRAME_WIDTH,
      frameHeight: Player.SPRITE_FRAME_HEIGHT,
    });
  }

  public create() {
    const tilemap: Phaser.Tilemaps.Tilemap = this.createTilemap();

    this.createPlayerSprite();

    this.gridPhysics = new GridPhysics(this.player, tilemap);
    this.gridControls = new GridControls(this.input, this.gridPhysics);

    this.pathfinder = this.createPathfinder(tilemap);

    this.input.on('pointerup', (pointer) => this.handleClick(pointer));
  }

  private handleClick(pointer) {
    const x = this.cameras.main.scrollX + pointer.x;
    const y = this.cameras.main.scrollY + pointer.y;
    const fromX = Math.floor(this.player.getTilePosition().x);
    const fromY = Math.floor(this.player.getTilePosition().y);
    const toX = Math.floor(x / GameConfiguration.TILE_SIZE);
    const toY = Math.floor(y / GameConfiguration.TILE_SIZE);
    const self = this;
    this.iteration_path = 1;

    this.pathfinder.findPath(fromX, fromY, toX, toY, function (path) {
      self.path = path;
      if (self.path === null) {
        console.warn("Path was not found.");
      } else {
        self.movePlayer(self);
      }
    });
    this.pathfinder.calculate();
  }

  private movePlayer(self: this): void {
    let delay = 0;

    function followThePath(delay: number) {
      setTimeout(function () {
        if (!self.path || !self.path[self.iteration_path]) {
          return;
        }

        const tile = self.path[self.iteration_path];
        const fromPosition = self.player.getTilePosition();
        const toPosition = new Phaser.Math.Vector2(tile.x, tile.y);
        const direction = MovementDirection.getDirection(fromPosition, toPosition);

        if (direction != Direction.NONE && self.gridPhysics.movePlayer(direction)) {
          self.iteration_path++;
        }

        if (self.iteration_path < self.path.length) {
          followThePath(100);
        }
      }, delay)
    }

    followThePath(delay);
  }

  private createTilemap(): Phaser.Tilemaps.Tilemap {
    const tilemap: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: this.CLOUD_CITY_MAP });

    tilemap.addTilesetImage(this.TILESET_CITY, this.TILESET_CITY);
    tilemap.addTilesetImage(this.TILESET_GROUND, this.TILESET_GROUND);

    for (let i = 0; i < tilemap.layers.length; i++) {
      const tileset: string = i == 1 ? this.TILESET_GROUND : this.TILESET_CITY;
      const layer = tilemap.createLayer(i, tileset, 0, 0);
      layer.setDepth(i);
      layer.scale = 3;
    }

    return tilemap;
  }

  private createPathfinder(tilemap: Phaser.Tilemaps.Tilemap): EasyStar {
    const pathfinder: EasyStar = new EasyStar();

    pathfinder.setGrid(this.createGrid(tilemap));
    pathfinder.setAcceptableTiles(this.acceptableTiles);

    return pathfinder;
  }

  private createGrid(tilemap: Phaser.Tilemaps.Tilemap): number[][] {
    const grid: number[][] = [];

    for (let y = 0; y < tilemap.height; y++) {
      const col = [];
      for (let x = 0; x < tilemap.width; x++) {
        const groundTile: Phaser.Tilemaps.Tile = tilemap.getTileAt(x, y, true, this.GROUND);
        let pushTile: Phaser.Tilemaps.Tile = groundTile;
        let isAcceptable: boolean = true;

        tilemap.layers.forEach(layer => {
          if (tilemap.getTileAt(x, y, true, layer.name).properties.collides) {
            pushTile = tilemap.getTileAt(x, y, true, layer.name);
            isAcceptable = false;
          }
        })

        col.push(pushTile.index);

        if (isAcceptable) {
          this.acceptableTiles.push(pushTile.index);
        }
      }

      grid.push(col);

    };

    this.acceptableTiles = this.acceptableTiles.filter((tile, index) => this.acceptableTiles.indexOf(tile) === index);

    return grid;
  }

  private createPlayerSprite() {
    const playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(0, 0, this.PLAYER);

    playerSprite.setDepth(2);

    this.cameras.main.startFollow(playerSprite);

    this.player = new Player(playerSprite);
    this.player.initialize(8, 9);
  }

  public update(_time: number, delta: number) {
    this.gridControls.update();
    this.gridPhysics.update(delta);
  }

}
