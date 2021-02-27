import { Player } from "../player/player";

export class GameScene extends Phaser.Scene {  
    private player: Player;

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
      playerSprite.setDepth(2);
      this.cameras.main.startFollow(playerSprite);
      this.player = new Player(playerSprite);
      this.player.setPosition(8,9);
  
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
  
    public update() {
      console.log('update method');
    }
  }
  