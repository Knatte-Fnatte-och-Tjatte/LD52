import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";

export class Wreckage {
    sprite: Physics.Matter.Sprite;

    constructor (scene:Scene, x:number, y:number) {
        this.sprite = scene.matter.add.sprite(x,y,'hull');
        this.sprite.setFrictionAir(0);
        this.sprite.setBounce(0.2);
        this.sprite.setRotation(Math.random() * Math.PI * 2);
        this.sprite.setMass(1000.0);
    }
}