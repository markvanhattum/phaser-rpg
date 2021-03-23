import { FrameRow } from './frame-row';
import { GameConfiguration } from '../game/game-configuration';
import Phaser from 'phaser';
import { Direction } from '../direction/direction.enum';

export class Player {
  public static readonly SPRITE_FRAME_WIDTH = 52;
  public static readonly SPRITE_FRAME_HEIGHT = 72;
  public static readonly SCALE_FACTOR = 1.5;
  
  public lastFootLeft = false;
  
  private static readonly CHAR_INDEX = Math.floor(Math.random() * Math.floor(8));
  private static readonly CHARS_IN_ROW = 4;
  private static readonly FRAMES_PER_CHAR_ROW = 3;
  private static readonly FRAMES_PER_CHAR_COL = 4;

  constructor(
    private sprite: Phaser.GameObjects.Sprite
  ) {
    this.sprite.scale = Player.SCALE_FACTOR;
    this.sprite.setFrame(this.framesOfDirection(Direction.DOWN).standing);
  }

  public getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getCenter();
  }

  public setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }
  
  public getTilePosition(): Phaser.Math.Vector2 {
    const x =
      (this.sprite.getCenter().x - this.playerOffsetX()) / GameConfiguration.TILE_SIZE;
    const y =
      (this.sprite.getCenter().y - this.playerOffsetY()) / GameConfiguration.TILE_SIZE;
    return new Phaser.Math.Vector2(Math.floor(x), Math.floor(y));
  }

  public getPlayerLayer() {
    return this.sprite.depth;
  }

  public setPlayerLayer(depth: number) {
    this.sprite.depth = depth;
  }
  
  public initialize(x: number, y: number) {
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

  private directionToFrameRow: { [key in Direction]?: number } = {
    [Direction.DOWN]: 0,
    [Direction.LEFT]: 1,
    [Direction.RIGHT]: 2,
    [Direction.UP]: 3,
  };

  public setWalkingFrame(direction: Direction): void {
    const frameRow = this.framesOfDirection(direction);
    this.sprite.setFrame(
      this.lastFootLeft ? frameRow.rightFoot : frameRow.leftFoot
    );
  }
  public setStandingFrame(direction: Direction): void {
    if (this.isCurrentFrameStanding(direction)) {
      this.lastFootLeft = !this.lastFootLeft;
    }
    this.sprite.setFrame(this.framesOfDirection(direction).standing);
  }

  private isCurrentFrameStanding(direction: Direction): boolean {
    return (
      Number(this.sprite.frame.name) !=
      this.framesOfDirection(direction).standing
    );
  }
  
  private framesOfDirection(direction: Direction): FrameRow {
    const playerRow = Math.floor(Player.CHAR_INDEX / Player.CHARS_IN_ROW);
    const playerCol = Player.CHAR_INDEX % Player.CHARS_IN_ROW;
    const framesInRow = Player.CHARS_IN_ROW * Player.FRAMES_PER_CHAR_ROW;
    const framesInSameRowBefore = Player.FRAMES_PER_CHAR_ROW * playerCol;
    const rows =
      this.directionToFrameRow[direction] +
      playerRow * Player.FRAMES_PER_CHAR_COL;
    const startFrame = framesInSameRowBefore + rows * framesInRow;
    return {
      leftFoot: startFrame,
      standing: startFrame + 1,
      rightFoot: startFrame + 2,
    };
  }
}
