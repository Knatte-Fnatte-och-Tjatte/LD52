import { Physics } from "phaser";
import { GameScene } from "../scenes/game/gameScene";

export class Floppy extends Physics.Matter.Sprite {
    message: string[];

    constructor (scene:GameScene, x:number, y:number, message: string[]) {
        super(scene.matter.world, x, y, 'packed', 'floppy');
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setBounce(0.4);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
        this.setMass(5.0);

        this.message = message;
    }
}