import { Physics } from "phaser";
import { GameScene } from "../scenes/game/gameScene";

export type CollectableType = "oxygen" | "fuel" | "blaster" | "transponder";

const COLLECTABLE_BOUNCE = 0.2;
const COLLECTABLE_MASS = 10.0;

export class Collectable extends Physics.Matter.Sprite {
    collectableType: CollectableType;
    value: number;

    constructor (scene:GameScene, x:number, y:number, value: number, collectableType: CollectableType) {
        super(scene.matter.world, x, y, 'packed', collectableType);
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setBounce(COLLECTABLE_BOUNCE);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
        this.setMass(COLLECTABLE_MASS);
        this.collectableType = collectableType;
        this.value = value;
    }
}