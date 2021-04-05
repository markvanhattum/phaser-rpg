import { GridPathfinder } from '../grid/grid-pathfinder';
import { GridPhysics } from './../grid/grid-physics';
import { GameConfiguration } from '../game/game-configuration';
import { GameConstants } from '../game/game-constants';
import { Player } from '../player/player';
import { GameScene } from './../game/game-scene';
import { js as EasyStar } from "easystarjs";
import { MovementDirection } from './../direction/movement-direction';
import { Direction } from '../direction/direction.enum';

export class InputService {
    private gridPathfinder: GridPathfinder;
    private easyStar: EasyStar;
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
        this.gridPathfinder = new GridPathfinder();
        this.easyStar = this.gridPathfinder.createPathfinder(tilemap);
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
        const x = gameScene.cameras.main.scrollX + pointer.x;
        const y = gameScene.cameras.main.scrollY + pointer.y;
        const fromX = Math.floor(player.getTilePosition().x);
        const fromY = Math.floor(player.getTilePosition().y);
        const toX = Math.floor(x / GameConfiguration.TILE_SIZE);
        const toY = Math.floor(y / GameConfiguration.TILE_SIZE);

        // const cost8tile = tilemap.getTileAt(0, 8, true, GameConstants.LAYER_PATH);
        // tilemap.putTileAt(cost8tile, toX, toY, false, GameConstants.LAYER_GROUND);
        // this.acceptableTiles.push(cost8tile.index);
        // this.acceptableTiles = this.acceptableTiles.filter((tile, index) => this.acceptableTiles.indexOf(tile) === index);
        // this.pathfinder.setAcceptableTiles(this.acceptableTiles);
        // this.gridPathfinder.setTileCost(this.pathfinder, tilemap);
        // console.log(this.acceptableTiles);

        this.easyStar.findPath(fromX, fromY, toX, toY, (path) => {
            if (path == null) {
                console.warn("Path was not found.");
            } else {
                this.path = path;
                this.iteration_path = 1;
                this.movePlayer(player, gridPhysics);
            }
        });
        this.easyStar.calculate();
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
                const direction = MovementDirection.getDirection(fromPosition, toPosition);

                if (direction != Direction.NONE && gridPhysics.movePlayer(direction)) {
                    console.log(tile);
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