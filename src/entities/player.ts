import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";

export class Player {
    sprite: Physics.Matter.Sprite;

    thrusterForward: GameObjects.Sprite;
    thrusterBackward: GameObjects.Sprite;
    thrusterRotateCW: GameObjects.Sprite;
    thrusterRotateCCW: GameObjects.Sprite;

    constructor (scene:Scene, x:number, y:number) {
        this.sprite = scene.matter.add.sprite(x,y,'player');
        this.sprite.setFrictionAir(0);
        this.sprite.setBounce(0.2);
        this.sprite.setRotation(Math.PI * 1.5);

        this.thrusterForward = scene.add.sprite(x,y,'thrust_forward');
        this.thrusterBackward = scene.add.sprite(x,y,'thrust_backward');
        this.thrusterRotateCW = scene.add.sprite(x,y,'thrust_rotate_cw');
        this.thrusterRotateCCW = scene.add.sprite(x,y,'thrust_rotate_ccw');
    }

    update(scene: Scene, time: number, delta: number) {
        const ndelta = delta / 16.0;
        const cursors = scene.input.keyboard.createCursorKeys();
        const body = this.sprite.body as any;
        let curAngVel = body.angularVelocity;
        if (cursors.left.isDown) {
            curAngVel += -0.002 * ndelta;
            this.thrusterRotateCCW.setVisible(true);
        } else {
            this.thrusterRotateCCW.setVisible(false);
        }

        if (cursors.right.isDown) {
            curAngVel -= -0.002 * ndelta;
            this.thrusterRotateCW.setVisible(true);
        } else {
            this.thrusterRotateCW.setVisible(false);
        }
        this.sprite.setAngularVelocity(curAngVel);

        if (cursors.up.isDown) {
            this.sprite.thrust(0.003 * ndelta);
            this.thrusterForward.setVisible(true);
        } else {
            this.thrusterForward.setVisible(false);
        }

        if (cursors.down.isDown) {
            this.sprite.thrust(-0.001 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        this.thrusterForward.x = this.sprite.x;
        this.thrusterForward.y = this.sprite.y;
        this.thrusterForward.angle = this.sprite.angle;

        this.thrusterBackward.x = this.sprite.x;
        this.thrusterBackward.y = this.sprite.y;
        this.thrusterBackward.angle = this.sprite.angle;

        this.thrusterRotateCW.x = this.sprite.x;
        this.thrusterRotateCW.y = this.sprite.y;
        this.thrusterRotateCW.angle = this.sprite.angle;

        this.thrusterRotateCCW.x = this.sprite.x;
        this.thrusterRotateCCW.y = this.sprite.y;
        this.thrusterRotateCCW.angle = this.sprite.angle;

    }
}