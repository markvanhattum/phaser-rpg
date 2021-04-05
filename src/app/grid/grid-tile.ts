import { Direction } from "../direction/direction.enum";
import { DirectionMovement } from "../direction/direction-movement";
import { GameConfiguration } from "../game/game-configuration";
import { Player } from "../player/player";
import { LayerService } from "../services/layer-service";

export class GridTile {

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