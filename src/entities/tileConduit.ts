import { GameObjects } from "phaser";
import { GameScene } from "../scenes/gamescene";

export class TileConduit extends GameObjects.Sprite {
    constructor (scene:GameScene, x:number, y:number) {
        super(scene, x, y, 'packed', 'plasma_tile_glow/plasma_tile_glow-0');
        this.setDepth(2).play('plasma_tile_glow_flicker');
        this.scene.add.existing(this);
    }
}