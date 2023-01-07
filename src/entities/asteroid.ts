import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";
import { GameScene } from "../scenes/gamescene";

const ASTEROID_MASS = 500.0;
const ASTEROID_BOUNCE = 0.2;

export class Asteroid extends Physics.Matter.Sprite {
    constructor (scene:GameScene, x:number, y:number, vx:number, vy:number) {
        super(scene.matter.world, x, y, 'asteroid');
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        const size = (Math.random() * 1.5) + 0.5;
        this.setScale(size);
        this.setBounce(ASTEROID_BOUNCE);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity(vx, vy);
        this.setMass(ASTEROID_MASS * size);
    }
}