import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";

export class Player {
    sprite: Physics.Matter.Sprite;

    constructor (scene:Scene, x:number, y:number) {
        this.sprite = scene.matter.add.sprite(x,y,'player');
        this.sprite.setFrictionAir(0);
        this.sprite.setBounce(0.2);
        this.sprite.setRotation(Math.PI * 1.5);
    }

    update(scene: Scene, time: number, delta: number) {
        const ndelta = delta / 16.0;
        const cursors = scene.input.keyboard.createCursorKeys();
        const body = this.sprite.body as any;
        let curAngVel = body.angularVelocity;
        if (cursors.left.isDown) {
            curAngVel += -0.002 * ndelta;
        } else if (cursors.right.isDown) {
            curAngVel -= -0.002 * ndelta;
        }
        this.sprite.setAngularVelocity(curAngVel);

        if (cursors.up.isDown) {
            this.sprite.thrust(0.003 * ndelta);
        }
        if (cursors.down.isDown) {
            this.sprite.thrust(-0.001 * ndelta);
        }
    }
}