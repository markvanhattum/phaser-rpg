import { GridPathfinder } from './../grid/grid-pathfinder';
import { GameConstants } from './game-constants';
import { InputService } from './../services/input-service';
import { LayerService } from './../services/layer-service';
import { GridPhysics } from "../grid/grid-physics";
import { Player } from "../player/player";

export class GameScene extends Phaser.Scene {
  private player: Player;
  private gridPhysics: GridPhysics;
  private gridPathfinder: GridPathfinder;
  private inputService: InputService;

  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.image(GameConstants.TILESET_CITY, '../../assets/cloud_tileset.png');
    this.load.image(GameConstants.TILESET_GROUND, '../../assets/gridtiles.png');
    this.load.tilemapTiledJSON(GameConstants.MAP_CLOUD_CITY, '../../assets/cloud_city.json');

    this.load.spritesheet(GameConstants.KEY_PLAYER, "assets/characters.png", {
      frameWidth: Player.SPRITE_FRAME_WIDTH,
      frameHeight: Player.SPRITE_FRAME_HEIGHT,
    });
  }

  create() {
    const tilemap: Phaser.Tilemaps.Tilemap = this.createTilemap();

    this.createPlayerSprite();

    this.gridPathfinder = new GridPathfinder(tilemap);
    this.gridPhysics = new GridPhysics(this.player, tilemap, this.gridPathfinder);

    this.inputService = new InputService(tilemap, this.input, this.gridPhysics, this.gridPathfinder);
    this.input.on('pointerup', (pointer) => this.inputService.handleClick(this, this.gridPhysics, tilemap, this.player, pointer));
  }

  update(_time: number, delta: number) {
    this.inputService.update();
    this.gridPhysics.update(delta);
  }

  private createTilemap(): Phaser.Tilemaps.Tilemap {
    const tilemap: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: GameConstants.MAP_CLOUD_CITY });

    tilemap.addTilesetImage(GameConstants.TILESET_CITY, GameConstants.TILESET_CITY);
    tilemap.addTilesetImage(GameConstants.TILESET_GROUND, GameConstants.TILESET_GROUND);

    let visibleLayers: Phaser.Tilemaps.LayerData[] = LayerService.getVisibleLayers(tilemap.layers);

    for (let i = 0; i < visibleLayers.length; i++) {
      const tileset: string = i == 1 ? GameConstants.TILESET_GROUND : GameConstants.TILESET_CITY;
      const layer = tilemap.createLayer(i, tileset, 0, 0);
      layer.setDepth(i);
      layer.scale = 3;
    }

    return tilemap;
  }

  private createPlayerSprite() {
    const playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(0, 0, GameConstants.KEY_PLAYER);

    playerSprite.setDepth(2);

    this.cameras.main.startFollow(playerSprite);

    this.player = new Player(playerSprite);
    this.player.initialize(8, 9);
  }

}
