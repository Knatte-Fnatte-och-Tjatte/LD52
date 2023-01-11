import { Physics } from "phaser";
import { GameScene } from "../scenes/game/gameScene";

const WRECKAGE_MASS = 1000.0;
const WRECKAGE_BOUNCE = 0.2;

export class Wreckage extends Physics.Matter.Sprite {

    constructor (scene:GameScene, x:number, y:number) {
        super(scene.matter.world, x, y, 'packed', 'hull');
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setScale(0.5);
        this.setBounce(WRECKAGE_BOUNCE);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1);
        this.setMass(WRECKAGE_MASS);
    }
}