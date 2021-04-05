import { Direction } from "./direction.enum";

export class MovementDirection {
      
    static VECTORS: {
        [key in Direction]?: Phaser.Math.Vector2;
      } = {
        [Direction.UP]: Phaser.Math.Vector2.UP,
        [Direction.DOWN]: Phaser.Math.Vector2.DOWN,
        [Direction.LEFT]: Phaser.Math.Vector2.LEFT,
        [Direction.RIGHT]: Phaser.Math.Vector2.RIGHT,
    };

    static getDirection(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Direction {
      let deltaX = to.x - from.x;
      let deltaY = to.y - from.y;
      let direction: Direction = Direction.NONE;

      if(deltaX > 0) {
        direction = Direction.RIGHT;
      } else if (deltaX < 0) {
        direction = Direction.LEFT;
      } else if (deltaY > 0) {
        direction = Direction.DOWN;
      } else if (deltaY < 0) {
        direction = Direction.UP;
      }

      return direction;
    }      
}
