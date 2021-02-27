export class GameConfiguration{
  static readonly CANVAS_WIDTH: number = 640;
  static readonly CANVAS_HEIGHT: number = 640;
  static readonly TILE_SIZE: number = 48;

  static readonly sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: "Game",
  };

  static gameConfig: Phaser.Types.Core.GameConfig = {
    title: "Phaser RPG",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scale: {
      width: GameConfiguration.CANVAS_WIDTH,
      height: GameConfiguration.CANVAS_HEIGHT,
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

}
