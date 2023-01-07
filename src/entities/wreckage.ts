import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { GameScene } from "../scenes/gamescene";

export class Wreckage extends Physics.Matter.Sprite {

    constructor (scene:GameScene, x:number, y:number) {
        super(scene.matter.world, x, y, 'hull');
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setBounce(0.2);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setMass(1000.0);
    }
}