import { GridPhysics } from './grid-physics';
import { DirectionEnum } from "../player/direction.enum";

export class GridControls {
    constructor(
      private input: Phaser.Input.InputPlugin,
      private gridPhysics: GridPhysics
    ) {}
  
    update() {
      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown) {
        this.gridPhysics.movePlayer(DirectionEnum.LEFT);
      } else if (cursors.right.isDown) {
        this.gridPhysics.movePlayer(DirectionEnum.RIGHT);
      } else if (cursors.up.isDown) {
        this.gridPhysics.movePlayer(DirectionEnum.UP);
      } else if (cursors.down.isDown) {
        this.gridPhysics.movePlayer(DirectionEnum.DOWN);
      }
    }
  }