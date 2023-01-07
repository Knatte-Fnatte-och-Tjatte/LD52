import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { GameScene } from "../scenes/gamescene";
import { Player } from "./player";

export type CollectableType = "oxygen" | "fuel" | "battery";

export class Collectable extends Physics.Matter.Sprite {
    collectableType: CollectableType;
    value: number;

    constructor (scene:GameScene, x:number, y:number, value: number, collectableType: CollectableType) {
        super(scene.matter.world, x, y, collectableType);
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setBounce(0.2);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
        this.setMass(1.0);
        this.collectableType = collectableType;
        this.value = value;

    }
}