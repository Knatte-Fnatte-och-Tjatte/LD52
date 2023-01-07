import { Body } from "matter";
import { Textures, GameObjects, Scene, Physics } from "phaser";

export class Player {
    fuel: number;
    fuelMax: number;

    air: number;
    airMax: number;

    energy: number;
    energyMax: number;

    sprite: Physics.Matter.Sprite;
    omniLight: GameObjects.Light;

    thrusterForward: GameObjects.Sprite;
    thrusterBackward: GameObjects.Sprite;
    thrusterRotateCW: GameObjects.Sprite;
    thrusterRotateCCW: GameObjects.Sprite;

    constructor (scene:Scene, x:number, y:number) {
        this.fuel = 800.0;
        this.fuelMax = 1000.0;

        this.air = 700.0;
        this.airMax = 1000.0;

        this.energy = 900.0;
        this.energyMax = 1000.0;

        this.sprite = scene.matter.add.sprite(x,y,'player');
        this.sprite.setScale(0.5, 0.5);
        this.sprite.setFrictionAir(0);
        this.sprite.setBounce(0.2);
        this.sprite.setRotation(Math.PI * 1.5);

        this.thrusterForward = scene.add.sprite(x,y,'thrust_forward');
        this.thrusterBackward = scene.add.sprite(x,y,'thrust_backward');
        this.thrusterRotateCW = scene.add.sprite(x,y,'thrust_rotate_cw');
        this.thrusterRotateCCW = scene.add.sprite(x,y,'thrust_rotate_ccw');

        this.omniLight = scene.lights.addLight(x, y, 512, 0xFFFFFF, 3.0);
    }

    update(scene: Scene, time: number, delta: number) {
        const ndelta = delta / 16.0;
        const cursors = scene.input.keyboard.createCursorKeys();
        const body = this.sprite.body as any;
        let curAngVel = body.angularVelocity;
        if (cursors.left.isDown && this.fuel > 0.0) {
            this.fuel -= ndelta * 1;
            curAngVel += -0.001 * ndelta;
            this.thrusterRotateCCW.setVisible(true);
        } else {
            this.thrusterRotateCCW.setVisible(false);
        }

        if (cursors.right.isDown && this.fuel > 0.0) {
            this.fuel -= ndelta * 1;
            curAngVel -= -0.001 * ndelta;
            this.thrusterRotateCW.setVisible(true);
        } else {
            this.thrusterRotateCW.setVisible(false);
        }
        this.sprite.setAngularVelocity(curAngVel);

        if (cursors.up.isDown && this.fuel > 0.0) {
            this.fuel -= ndelta * 1;
            this.sprite.thrust(0.001 * ndelta);
            this.thrusterForward.setVisible(true);
        } else {
            this.thrusterForward.setVisible(false);
        }

        if (cursors.down.isDown && this.fuel > 0.0) {
            this.fuel -= ndelta * 1;
            this.sprite.thrust(-0.001 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        this.air -= 0.01 * ndelta;
        this.energy -= 0.001 * ndelta;

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

        this.omniLight.setPosition(this.sprite.x, this.sprite.y);
    }
}