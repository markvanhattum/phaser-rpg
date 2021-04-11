import { GridPathfinder } from './../grid/grid-pathfinder';
import { Direction } from "../direction/direction.enum";
import { DirectionMovement } from "../direction/direction-movement";
import { GameConfiguration } from "../game/game-configuration";
import { Player } from "../player/player";
import { LayerService } from "./layer-service";
import { GameConstants } from "../game/game-constants";
import { Node } from "../interfaces";

export class TileService {

    static updateTileCost(tilemap: Phaser.Tilemaps.Tilemap, gridPathfinder: GridPathfinder, node: Node, deltaCost: number, doCreateHill: boolean) {
        const oldTile = tilemap.getTileAt(node.x, node.y, true, GameConstants.LAYER_GROUND);
        
        if(!oldTile) {
            console.warn('tile (',node.x,',',node.y,') not found!');
            return;
        }
        
        const newCost = Math.min(20, Math.max(1, oldTile.properties.cost + deltaCost));

        const pathTile = tilemap.findTile(
            (tile: Phaser.Tilemaps.Tile, index: number, array: Phaser.Tilemaps.Tile[]) => tile.properties.cost === newCost,
            null,
            0,
            0,
            tilemap.width,
            tilemap.height,
            null,
            GameConstants.LAYER_PATH);

        const groundTile = tilemap.putTileAt(pathTile, node.x, node.y, false, GameConstants.LAYER_GROUND);

        gridPathfinder.setNode(gridPathfinder.createNode(groundTile));

        if (doCreateHill) {
            this.createHill(tilemap, gridPathfinder, { x: node.x, y: node.y, cost: newCost });
        }
    }

    static createHill(tilemap: Phaser.Tilemaps.Tilemap, gridPathFinder: GridPathfinder, node: Node) {
        let distance: number = 1;
        let hillNodes: Node[] = [];

        for (let newCost = node.cost - 1; newCost > 0; newCost--) {
            const validTiles: Phaser.Tilemaps.Tile[] = tilemap.filterTiles((tile: Phaser.Tilemaps.Tile) => {
                return tile.index > 0 && Math.abs(tile.x - node.x) + Math.abs(tile.y - node.y) === distance;
            }, null, 0, 0, tilemap.width, tilemap.height, null, GameConstants.LAYER_GROUND);


            validTiles.forEach(tile => {
                const newDelta = newCost - tile.properties.cost;
                if (newDelta > 0) {
                    hillNodes.push({ x: tile.x, y: tile.y, cost: newDelta });
                }
            })

            distance = distance + 1;
        }

        hillNodes.forEach(node => {
            this.updateTileCost(tilemap, gridPathFinder, node, node.cost, false);
        })

    }

    /**
     * Returns whether this update the player will cross the tile border.
     *
     * @param pixelsToWalkThisUpdate Number of pixels to walk this update.
     */
    willCrossTileBorderThisUpdate(
        tileSizePixelsWalked: number,
        pixelsToWalkThisUpdate: number
    ): boolean {
        return (
            tileSizePixelsWalked + pixelsToWalkThisUpdate >=
            GameConfiguration.TILE_SIZE
        );
    }

    hasWalkedHalfATile(numberOfPixelsWalkedOnThisTile: number): boolean {
        return numberOfPixelsWalkedOnThisTile > GameConfiguration.TILE_SIZE / 2;
    }

    /**
     * Returns the position of the next tile in the given direction.
     *
     * @param direction The given direction.
     */
    getTilePositionInDirection(
        player: Player,
        direction: Direction
    ): Phaser.Math.Vector2 {
        return player
            .getTilePosition()
            .add(DirectionMovement.VECTORS[direction]);
    }

    /**
     * Returns whether the given position contains a tile.
     *
     * @param position The given position.
     */
    private hasATile(tilemap: Phaser.Tilemaps.Tilemap, position: Phaser.Math.Vector2): boolean {
        return tilemap.layers.some((layer) =>
            tilemap.hasTileAt(position.x, position.y, layer.name)
        );
    }

    /**
     * Returns whether the given position containts a blocking tile.
     *
     * @param position The given position.
     */
    hasBlockingTile(tilemap: Phaser.Tilemaps.Tilemap, position: Phaser.Math.Vector2): boolean {
        if (!this.hasATile(tilemap, position)) {
            return true;
        }
        return LayerService.getVisibleLayers(tilemap.layers).some((layer) => {
            const tile = this.getTileAtPosition(tilemap, position, layer);
            return tile && tile.properties.collides;
        });
    }

    private getTileAtPosition(tilemap: Phaser.Tilemaps.Tilemap, position: Phaser.Math.Vector2, layer: Phaser.Tilemaps.LayerData): Phaser.Tilemaps.Tile {
        return tilemap.getTileAt(position.x, position.y, false, layer.name);
    }


}