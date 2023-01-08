import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { GameScene } from "../scenes/gamescene";

export class TileConduit extends GameObjects.Sprite {
    constructor (scene:GameScene, x:number, y:number) {
        super(scene, x, y, 'plasma_tile_glow');
        this.setDepth(2).play('plasma_tile_glow_flicker');
        this.scene.add.existing(this);
    }
}