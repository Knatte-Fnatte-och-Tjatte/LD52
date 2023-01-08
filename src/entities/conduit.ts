import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { GameScene } from "../scenes/gamescene";

export class Conduit extends Physics.Matter.Sprite {
    glow: GameObjects.Sprite;

    constructor (scene:GameScene, x:number, y:number) {
        super(scene.matter.world, x, y, 'plasma_conduit');
        this.scene.add.existing(this);
        this.setStatic(true);
        this.glow = scene.add.sprite(x,y,'plasma_glow').setDepth(2).play('plasma_glow_flicker');
    }
}