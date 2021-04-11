import { LayerService } from './../services/layer-service';
import { GameConstants } from "../game/game-constants";
import { Node } from "../interfaces";

export class GridPathfinder {
    pathfinder;
    grid: Node[];

    constructor(tilemap: Phaser.Tilemaps.Tilemap) {
        this.pathfinder = this.createPathfinder(tilemap);
    }

    findPath(from: Node, to: Node): Node[] {
        const path = this.pathfinder.findPath(
            { x: from.x, y: from.y },
            { x: to.x, y: to.y });
        return path;
    }

    private createPathfinder(tilemap: Phaser.Tilemaps.Tilemap): typeof AbstractPathfinder {
        const AbstractPathfinder = require('abstract-pathfinder')
        const pathfinder: typeof AbstractPathfinder = new AbstractPathfinder();

        this.grid = this.createGrid(tilemap);

        pathfinder.nodeToPrimitive = ((node: Node) => this.createNodeId(node));
        pathfinder.getNeighbors = ((node: Node) => this.createNeighboursArray(tilemap, node));
        pathfinder.getMovementCost = ((from: Node, to: Node) => this.getCost(to));
        pathfinder.getHeuristic = ((from: Node, to: Node) => Math.abs(from.x - to.x) + Math.abs(from.y - to.y));

        return pathfinder;
    }

    private createGrid(tilemap: Phaser.Tilemaps.Tilemap): Node[] {
        const grid: Node[] = [];

        for (let y = 0; y < tilemap.height; y++) {
            for (let x = 0; x < tilemap.width; x++) {
                const groundTile: Phaser.Tilemaps.Tile = tilemap.getTileAt(x, y, true, GameConstants.LAYER_GROUND);
                let pushTile: Phaser.Tilemaps.Tile = groundTile;

                LayerService.getVisibleLayers(tilemap.layers).forEach(layer => {
                    if (tilemap.getTileAt(x, y, true, layer.name).properties.collides) {
                        pushTile = tilemap.getTileAt(x, y, true, layer.name);
                    }
                })

                grid.push(this.createNode(pushTile));
            }
        };

        return grid;
    }

    private createNodeId(node: Node): string {
        return '(' + node.x + ',' + node.y + ')';
    }

    createNeighboursArray(tilemap: Phaser.Tilemaps.Tilemap, node: Node): Node[] {
        let neighbours: Node[] = [];
        const x = node.x
        const y = node.y

        if (x > 0) {
            neighbours.push({ x: x - 1, y: y });
        }
        if (y > 0) {
            neighbours.push({ x: x, y: y - 1 });
        }
        if (x < tilemap.width - 1) {
            neighbours.push({ x: x + 1, y });
        }
        if (y < tilemap.height - 1) {
            neighbours.push({ x: x, y: y + 1 });
        }

        return neighbours
    }

    private getCost(node: Node): number {
        return this.grid.find(existing => existing.x === node.x && existing.y === node.y).cost;
    }

    createNode(tile: Phaser.Tilemaps.Tile): Node {
        return {
            id: this.createNodeId({ x: tile.x, y: tile.y }),
            x: tile.x,
            y: tile.y,
            cost: tile.properties.collides ? -1 : tile.properties.cost
        }
    }

    setNode(node: Node): void {
        const toBeReplaced: Node = this.grid.find(existing => existing.x === node.x && existing.y === node.y);
        const index = this.grid.indexOf(toBeReplaced);

        if (index !== -1) {
            this.grid.splice(index, 1);
        }

        this.grid.push(node);
    }

}