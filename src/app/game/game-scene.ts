import { GridControls } from "../grid/grid-controls";
import { GridPhysics } from "../grid/grid-physics";
import { Player } from "../player/player";

export class GameScene extends Phaser.Scene {  
    private player: Player;
    private gridControls: GridControls;
    private gridPhysics: GridPhysics;
    
    constructor() {
      super({ key: 'main' });
    }
  
    public create() {
      console.log('create method');
      const cloudCityTilemap = this.make.tilemap({ key: "cloud-city-map" });
      cloudCityTilemap.addTilesetImage("Cloud City", "tiles");
      for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
        const layer = cloudCityTilemap
          .createLayer(i, "Cloud City", 0, 0)
        layer.setDepth(i);
        layer.scale = 3;
      }
  
      const playerSprite = this.physics.add.sprite(0, 0, "player");
      playerSprite.setDepth(1);
      this.cameras.main.startFollow(playerSprite);
      this.player = new Player(playerSprite);
      this.player.initialize(8,9);
  
      this.gridPhysics = new GridPhysics(this.player);
      this.gridControls = new GridControls(
        this.input,
        this.gridPhysics
      );
    }  
  
    public preload() {
      console.log('preload method');
      this.load.image('tiles', '../../assets/cloud_tileset.png');
      this.load.tilemapTiledJSON('cloud-city-map', '../../assets/cloud_city.json'); 
  
      this.load.spritesheet("player", "assets/characters.png", {
        frameWidth: Player.SPRITE_FRAME_WIDTH,
        frameHeight: Player.SPRITE_FRAME_HEIGHT,
      });
    }
  
    public update(_time: number, delta: number) {
        this.gridControls.update();
        this.gridPhysics.update(delta);
    }
  }
  