import { js as EasyStar } from "easystarjs";
import { GameConstants } from "../game/game-constants";

export class GridPathfinder {
    private acceptableTiles: number[] = [];

    public createPathfinder(tilemap: Phaser.Tilemaps.Tilemap): EasyStar {
        const pathfinder: EasyStar = new EasyStar();
        pathfinder.setGrid(this.createGrid(pathfinder, tilemap));
        pathfinder.setAcceptableTiles(this.acceptableTiles);

        return pathfinder;
    }

    private createGrid(pathfinder: EasyStar, tilemap: Phaser.Tilemaps.Tilemap): number[][] {
        const grid: number[][] = [];

        for (let y = 0; y < tilemap.height; y++) {
            const col = [];
            for (let x = 0; x < tilemap.width; x++) {
                const groundTile: Phaser.Tilemaps.Tile = tilemap.getTileAt(x, y, true, GameConstants.LAYER_GROUND);
                let pushTile: Phaser.Tilemaps.Tile = groundTile;
                let isAcceptable: boolean = true;

                tilemap.layers.forEach(layer => {
                    if (tilemap.getTileAt(x, y, true, layer.name).properties.collides) {
                        pushTile = tilemap.getTileAt(x, y, true, layer.name);
                        isAcceptable = false;
                    }
                })

                col.push(pushTile.index);

                if (isAcceptable) {
                    this.acceptableTiles.push(pushTile.index);
                    console.log('tile index =', pushTile.index);
                    console.log('tile cost =', pushTile.properties.cost);
                }

            }

            grid.push(col);

        };

        this.acceptableTiles = this.acceptableTiles.filter((tile, index) => this.acceptableTiles.indexOf(tile) === index);
        this.setTileCost(pathfinder, tilemap);

        return grid;
    }

    public setTileCost(pathfinder: EasyStar, tilemap: Phaser.Tilemaps.Tilemap) {
        for (let i = 0; i < this.acceptableTiles.length; i++) {
            const tile = tilemap.findTile(tile => tile.index == this.acceptableTiles[i], null, 0, 0, tilemap.width, tilemap.height, null, GameConstants.LAYER_PATH);
            console.log('acceptable tile index =', this.acceptableTiles[i]);
            console.log('found tile =', tile);
            // pathfinder.setTileCost(i + 1, tile.properties.cost);
            pathfinder.setTileCost(tile.index, tile.properties.cost);
        }
    }

}