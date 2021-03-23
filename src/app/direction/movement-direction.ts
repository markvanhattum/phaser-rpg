import { Direction } from "./direction.enum";

export class MovementDirection {
      
    public static VECTORS: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.UP]: Phaser.Math.Vector2.UP,
        [Direction.DOWN]: Phaser.Math.Vector2.DOWN,
        [Direction.LEFT]: Phaser.Math.Vector2.LEFT,
        [Direction.RIGHT]: Phaser.Math.Vector2.RIGHT,
    };
      
}
