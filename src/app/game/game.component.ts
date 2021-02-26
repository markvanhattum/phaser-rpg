import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {

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
      layer.scale = 2;
    }
  }  

  public preload() {
    console.log('preload method');
    this.load.image('tiles', '../../assets/cloud_tileset.png');
    this.load.tilemapTiledJSON('cloud-city-map', '../../assets/cloud_city.json'); 
  }

  public update() {
    console.log('update method');
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  static readonly CANVAS_WIDTH = 640;
  static readonly CANVAS_HEIGHT = 640;
  static readonly TILE_SIZE = 48;

  static readonly sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game",
  };

  static readonly gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Phaser RPG",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scene: GameScene,
    scale: {
      width: GameComponent.CANVAS_WIDTH,
      height: GameComponent.CANVAS_HEIGHT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
  
    parent: "game",
    backgroundColor: "#48C4F8",
  };

  phaserGame: Phaser.Game;

  constructor() {
    GameComponent.gameConfig; 
  }
  
  ngOnInit() {
    this.phaserGame = new Phaser.Game(GameComponent.gameConfig);
  }
}
