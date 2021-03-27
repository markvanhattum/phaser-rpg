import { GridControls } from "../grid/grid-controls";
import { GridPhysics } from "../grid/grid-physics";
import { Player } from "../player/player";
import { GameConfiguration } from "./game-configuration";

export class GameScene extends Phaser.Scene {
  private readonly TILESET_CITY: string = 'Cloud City';
  private readonly TILESET_GROUND: string = 'Cloud Ground';
  private readonly CLOUD_CITY_MAP: string = 'cloud-city-map';
  private readonly PLAYER: string = 'player';
  private player: Player;
  private gridControls: GridControls;
  private gridPhysics: GridPhysics;

  constructor() {
    super({ key: 'main' });
  }

  public preload() {
    console.log('preload method');
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
  }

  private createTilemap(): Phaser.Tilemaps.Tilemap {
    let tilemap: Phaser.Tilemaps.Tilemap = this.make.tilemap({ key: this.CLOUD_CITY_MAP });

    tilemap.addTilesetImage(this.TILESET_CITY, this.TILESET_CITY);
    tilemap.addTilesetImage(this.TILESET_GROUND, this.TILESET_GROUND);

    for (let i = 0; i < tilemap.layers.length; i++) {
      let tileset: string = i == 1 ? this.TILESET_GROUND : this.TILESET_CITY;
      const layer = tilemap.createLayer(i, tileset, 0, 0);
      layer.setDepth(i);
      layer.scale = 3;
    }

    return tilemap;
  }

  private createPlayerSprite(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    let playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody = this.physics.add.sprite(0, 0, this.PLAYER);

    playerSprite.setDepth(2);

    this.cameras.main.startFollow(playerSprite);

    this.player = new Player(playerSprite);
    this.player.initialize(8, 9);

    return playerSprite;
  }

  public update(_time: number, delta: number) {
    this.gridControls.update();
    this.gridPhysics.update(delta);
  }
}
