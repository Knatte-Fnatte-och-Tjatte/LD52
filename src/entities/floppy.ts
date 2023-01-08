import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { GameScene } from "../scenes/gamescene";
import { Player } from "./player";

export class Floppy extends Physics.Matter.Sprite {
    message: string[];

    constructor (scene:GameScene, x:number, y:number, message: string[]) {
        super(scene.matter.world, x, y, 'floppy');
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setBounce(0.4);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
        this.setMass(5.0);

        this.message = message;
    }
}