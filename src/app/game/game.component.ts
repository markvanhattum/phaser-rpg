import { GameConfiguration } from './game-configuration';
import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { GameScene } from './game-scene';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html'
})
export class GameComponent implements OnInit {
  private phaserGame: Phaser.Game;

  constructor() {
    GameConfiguration.gameConfig;
  }

  ngOnInit() {
    GameConfiguration.gameConfig.scene = GameScene;
    this.phaserGame = new Phaser.Game(GameConfiguration.gameConfig);
  }
}
