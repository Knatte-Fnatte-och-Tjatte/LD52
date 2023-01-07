import { GameObjects, Scene, Physics, Types } from "phaser";
import { WASDKeyMap } from "../scenes/gamescene";
import { Collectable } from "./collectable";

export class Player extends Physics.Matter.Sprite {
    fuel: number;
    fuelMax: number;

    oxygen: number;
    oxygenMax: number;

    battery: number;
    batteryMax: number;

    lightmap: GameObjects.Sprite;

    thrusterForward: GameObjects.Sprite;
    thrusterBackward: GameObjects.Sprite;
    thrusterRotateCW: GameObjects.Sprite;
    thrusterRotateCCW: GameObjects.Sprite;

    cursorKeys: Types.Input.Keyboard.CursorKeys;
    wasdKeys: WASDKeyMap;

    collideWith(other: any) {
        if(other instanceof Collectable){
            this[other.collectableType] = this[other.collectableType] + other.value;
            this.ceilResources();
            switch(other.collectableType){
                case "battery":
                    this.scene.sound.add('battery_change').play();
                    break;
                case "fuel":
                    this.scene.sound.add('fuel_change').play();
                    break;
                case "oxygen":
                    this.scene.sound.add('oxygen_change').play();
                    break;
            }
            other.destroy();
        }
    }

    ceilResources() {
        this.fuel = Math.min(this.fuel, this.fuelMax);
        this.oxygen = Math.min(this.oxygen, this.oxygenMax);
        this.battery = Math.min(this.battery, this.batteryMax);
    }

    constructor (scene:Scene, x:number, y:number, cursorKeys: Types.Input.Keyboard.CursorKeys, wasdKeys: WASDKeyMap) {
        super(scene.matter.world, x, y, 'player');
        scene.add.existing(this);

        this.fuel = 800.0;
        this.fuelMax = 1000.0;

        this.oxygen = 700.0;
        this.oxygenMax = 1000.0;

        this.battery = 900.0;
        this.batteryMax = 1000.0;

        this.setScale(0.5, 0.5);
        this.setFrictionAir(0);
        this.setBounce(0.2);
        this.setRotation(Math.PI * 1.5);
        this.setMass(100.0);

        this.thrusterForward = scene.add.sprite(x,y,'thrust_forward');
        this.thrusterBackward = scene.add.sprite(x,y,'thrust_backward');
        this.thrusterRotateCW = scene.add.sprite(x,y,'thrust_rotate_cw');
        this.thrusterRotateCCW = scene.add.sprite(x,y,'thrust_rotate_ccw');
        this.thrusterForward.setDepth(2);
        this.thrusterBackward.setDepth(2);
        this.thrusterRotateCW.setDepth(2);
        this.thrusterRotateCCW.setDepth(2);

        this.cursorKeys = cursorKeys;
        this.wasdKeys = wasdKeys;

        this.lightmap = scene.add.sprite(x,y,'lightmap');
        this.lightmap.setScale(0.5);
        this.lightmap.setDepth(1);
        //this.lightmap.setVisible(false);
    }

    update(time: number, delta: number) {
        const ndelta = delta / 16.0;
        const body = this.body as any;
        let curAngVel = body.angularVelocity;
        if ((this.cursorKeys.left.isDown || this.wasdKeys.Q.isDown) && this.fuel > 0.0) {
            this.fuel -= ndelta * 0.1;
            curAngVel += -0.0003 * ndelta;
            this.thrusterRotateCCW.setVisible(true);
        } else {
            this.thrusterRotateCCW.setVisible(false);
        }

        if ((this.cursorKeys.right.isDown || this.wasdKeys.E.isDown) && this.fuel > 0.0) {
            this.fuel -= ndelta * 0.1;
            curAngVel -= -0.0003 * ndelta;
            this.thrusterRotateCW.setVisible(true);
        } else {
            this.thrusterRotateCW.setVisible(false);
        }
        this.setAngularVelocity(curAngVel);

        if ((this.cursorKeys.up.isDown || this.wasdKeys.W.isDown) && this.fuel > 0.0) {
            this.fuel -= ndelta * 0.1;
            this.thrust(0.01 * ndelta);
            this.thrusterForward.setVisible(true);
        } else {
            this.thrusterForward.setVisible(false);
        }

        if ((this.cursorKeys.down.isDown || this.wasdKeys.S.isDown) && this.fuel > 0.0) {
            this.fuel -= ndelta * 0.1;
            this.thrustBack(0.01 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        if (this.wasdKeys.A.isDown && this.fuel > 0.0) {
            this.fuel -= ndelta * 0.1;
            this.thrustLeft(0.01 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        if (this.wasdKeys.D.isDown && this.fuel > 0.0) {
            this.fuel -= ndelta * 0.1;
            this.thrustRight(0.01 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        this.oxygen -= 0.01 * ndelta;
        this.battery -= 0.001 * ndelta;

        this.thrusterForward.x = this.x;
        this.thrusterForward.y = this.y;
        this.thrusterForward.angle = this.angle;

        this.thrusterBackward.x = this.x;
        this.thrusterBackward.y = this.y;
        this.thrusterBackward.angle = this.angle;

        this.thrusterRotateCW.x = this.x;
        this.thrusterRotateCW.y = this.y;
        this.thrusterRotateCW.angle = this.angle;

        this.thrusterRotateCCW.x = this.x;
        this.thrusterRotateCCW.y = this.y;
        this.thrusterRotateCCW.angle = this.angle;

        this.lightmap.setPosition(this.x, this.y);
        this.lightmap.angle = this.angle;
    }
}