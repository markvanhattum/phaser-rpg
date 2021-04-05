import { GridPathfinder } from '../grid/grid-pathfinder';
import { GridPhysics } from './../grid/grid-physics';
import { GameConfiguration } from '../game/game-configuration';
import { Player } from '../player/player';
import { GameScene } from './../game/game-scene';
import { DirectionMovement } from '../direction/direction-movement';
import { Direction } from '../direction/direction.enum';
import { Node } from "../interfaces";
import { GameConstants } from '../game/game-constants';

export class InputService {
    private gridPathfinder: GridPathfinder;
    private iteration_path: number;
    private path: {
        x: number;
        y: number;
    }[];

    constructor(
        private tilemap: Phaser.Tilemaps.Tilemap,
        private input: Phaser.Input.InputPlugin,
        private gridPhysics: GridPhysics
    ) {
        this.gridPathfinder = new GridPathfinder(tilemap);
    }

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.gridPhysics.movePlayer(Direction.LEFT);
        } else if (cursors.right.isDown) {
            this.gridPhysics.movePlayer(Direction.RIGHT);
        } else if (cursors.up.isDown) {
            this.gridPhysics.movePlayer(Direction.UP);
        } else if (cursors.down.isDown) {
            this.gridPhysics.movePlayer(Direction.DOWN);
        } else if (cursors.space.isDown) {
            this.gridPhysics.movePlayerToRandomPlace();
        }
    }

    handleClick(gameScene: GameScene, gridPhysics: GridPhysics, tilemap: Phaser.Tilemaps.Tilemap, player: Player, pointer) {
        const from: Node = {
            x: Math.floor(player.getTilePosition().x),
            y: Math.floor(player.getTilePosition().y)
        };
        const to: Node = {
            x: Math.floor((gameScene.cameras.main.scrollX + pointer.x) / GameConfiguration.TILE_SIZE),
            y: Math.floor((gameScene.cameras.main.scrollY + pointer.y) / GameConfiguration.TILE_SIZE)
        };

        const pathTile = tilemap.getTileAt(0, 8, true, GameConstants.LAYER_PATH);
        const groundTile = tilemap.putTileAt(pathTile, to.x, to.y, false, GameConstants.LAYER_GROUND);
        this.gridPathfinder.setNode(this.gridPathfinder.createNode(groundTile));
        let path: Node[] = this.gridPathfinder.findPath(from, to);

        if (path.length == 0) {
            console.warn("Path was not found.");
        } else {
            this.path = path;
            this.iteration_path = 1;
            this.movePlayer(player, gridPhysics);
        }
    }

    private movePlayer(player: Player, gridPhysics: GridPhysics): void {
        let delay = 0;

        const followThePath = (delay: number) => {
            setTimeout(() => {
                if (!this.path || !this.path[this.iteration_path]) {
                    return;
                }

                const tile = this.path[this.iteration_path];
                const fromPosition = player.getTilePosition();
                const toPosition = new Phaser.Math.Vector2(tile.x, tile.y);
                const direction = DirectionMovement.getDirection(fromPosition, toPosition);

                if (direction != Direction.NONE && gridPhysics.movePlayer(direction)) {
                    this.iteration_path++;
                }

                if (this.iteration_path < this.path.length) {
                    followThePath(100);
                }
            }, delay)
        }

        followThePath(delay);
    }


}