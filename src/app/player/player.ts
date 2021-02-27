import { GameConfiguration } from '../game/game-configuration';
import Phaser from 'phaser';

export class Player {
  public static readonly SPRITE_FRAME_WIDTH = 52;
  public static readonly SPRITE_FRAME_HEIGHT = 72;
  public static readonly SCALE_FACTOR = 1.5;

  constructor(
    private sprite: Phaser.GameObjects.Sprite
  ) {
    this.sprite.scale = Player.SCALE_FACTOR;
    this.sprite.setFrame(55);
  }

  public getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getCenter();
  }

  public setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }
  
  public setCoordinates(x: number, y: number) {
    this.sprite.setPosition(
      x * GameConfiguration.TILE_SIZE + this.playerOffsetX(),
      y * GameConfiguration.TILE_SIZE + this.playerOffsetY()
    );
  }
  
  private playerOffsetX(): number {
    return GameConfiguration.TILE_SIZE / 2;
  }

  private playerOffsetY(): number {
    return (
      -(
        (Player.SPRITE_FRAME_HEIGHT * Player.SCALE_FACTOR) %
        GameConfiguration.TILE_SIZE
      ) / 2
    );
  }
}
