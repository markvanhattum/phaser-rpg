import { GameConstants } from './../game/game-constants';
import { Player } from "../player/player";

export class LayerService {

  /**
   * Filters all visible layers.
   * 
   * @param layers All layers.
   * @returns All visible layers.
   */
  static getVisibleLayers(layers: Phaser.Tilemaps.LayerData[]): Phaser.Tilemaps.LayerData[] {
    return layers.filter(layer => layer.properties.find(
      (property: { name: string, type: string, value: boolean; }) =>
        property.name == 'visible' && property.type == 'bool' && property.value == true));
  }

  private static readonly GROUND_LAYERS: string[] = [GameConstants.LAYER_BORDER, GameConstants.LAYER_GROUND];
  private static readonly DISTANCE_FROM_PLAYER: number = 20;

  static updateLayers(tilemap: Phaser.Tilemaps.Tilemap, player: Player) {
    let backgroundTiles: Phaser.Tilemaps.Tile[] = [];
    let foregroundTiles: Phaser.Tilemaps.Tile[] = [];

    tilemap.layers.forEach((layer) => {
      if (this.GROUND_LAYERS.includes(layer.name)) {
        return;
      }
      backgroundTiles = this.addTiles(tilemap, player, backgroundTiles, layer, -this.DISTANCE_FROM_PLAYER, tile => tile.y <= player.getTilePosition().y);
      foregroundTiles = this.addTiles(tilemap, player, foregroundTiles, layer, 1, tile => tile.y > player.getTilePosition().y);
    });

    const backgroundLayers: Array<Phaser.Tilemaps.LayerData> = this.getLayersFromTiles(backgroundTiles);
    const foregroundLayers: Array<Phaser.Tilemaps.LayerData> = this.getLayersFromTiles(foregroundTiles);

    const maxBackgroundLayer: Phaser.Tilemaps.LayerData = this.getOneLayer(tilemap, backgroundLayers, true);
    const minForegroundLayer: Phaser.Tilemaps.LayerData = this.getOneLayer(tilemap, foregroundLayers, false);

    player.setPlayerLayer(maxBackgroundLayer.tilemapLayer.depth + 1);

    const delta = player.getPlayerLayer() + 1 - minForegroundLayer.tilemapLayer.depth;
    foregroundLayers
      .filter(layer => !!layer?.tilemapLayer)
      .forEach(layer => {
        layer.tilemapLayer.depth = layer.tilemapLayer.depth + delta;
      });
  }

  private static addTiles(tilemap: Phaser.Tilemaps.Tilemap, player: Player, tiles: Phaser.Tilemaps.Tile[], layer: Phaser.Tilemaps.LayerData, deltaY: number, predicate): Phaser.Tilemaps.Tile[] {
    return tiles.concat(tilemap.getTilesWithin(
      player.getTilePosition().x - this.DISTANCE_FROM_PLAYER,
      player.getTilePosition().y + deltaY,
      2 * this.DISTANCE_FROM_PLAYER,
      this.DISTANCE_FROM_PLAYER, null, layer.name)
      .filter(predicate)
      .filter(tile => tile.properties.collides));
  }

  private static getLayersFromTiles(tiles: Phaser.Tilemaps.Tile[]): Phaser.Tilemaps.LayerData[] {
    const layers: Phaser.Tilemaps.LayerData[] = tiles.map(tile => tile.layer);
    return layers.filter((layer, index) => layers.indexOf(layer) === index);
  }

  private static getOneLayer(tilemap: Phaser.Tilemaps.Tilemap, layers: Phaser.Tilemaps.LayerData[], max: boolean): Phaser.Tilemaps.LayerData {
    layers = LayerService.getVisibleLayers(layers);

    return layers.length == 0 ? tilemap.getLayer(GameConstants.LAYER_BORDER) : layers.reduce(
      (minMax, current) => {
        if (max) {
          return minMax.tilemapLayer.depth > current.tilemapLayer.depth ? minMax : current;
        } else {
          return minMax.tilemapLayer.depth < current.tilemapLayer.depth ? minMax : current;
        }
      });
  }
}