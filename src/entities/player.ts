import { GameObjects, Scene, Physics, Types, Math as PhaserMath } from "phaser";
import { WASDKeyMap } from "../scenes/gamescene";
import { Collectable } from "./collectable";
import { Wreckage } from "./wreckage";

export class Player extends Physics.Matter.Sprite {
    fuel: number;
    fuelMax: number;

    oxygen: number;
    oxygenMax: number;

    battery: number;
    batteryMax: number;

    lightmap: GameObjects.Sprite;

    stunned: number;
    isDead: boolean;
    didCollide: boolean;
    collisionVelocity: PhaserMath.Vector2 | MatterJS.Vector;

    thrusterForward: GameObjects.Sprite;
    thrusterBackward: GameObjects.Sprite;
    thrusterRotateCW: GameObjects.Sprite;
    thrusterRotateCCW: GameObjects.Sprite;

    cursorKeys: Types.Input.Keyboard.CursorKeys;
    wasdKeys: WASDKeyMap;

    collideWith(e:Types.Physics.Matter.MatterCollisionData, other: any) {
        if(this.isDead || this.stunned > 0.0){return;}
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
        if(other instanceof Wreckage){
            this.didCollide = true;
            this.collisionVelocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
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

        this.stunned = -1.0;
        this.fuel = 800.0;
        this.fuelMax = 1000.0;

        this.oxygen = 700.0;
        this.oxygenMax = 1000.0;

        this.battery = 900.0;
        this.batteryMax = 1000.0;

        this.isDead = false;

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
        this.collisionVelocity = this.body.velocity;
        this.didCollide = false;

        this.lightmap = scene.add.sprite(x,y,'lightmap');
        this.lightmap.setScale(0.5);
        this.lightmap.setDepth(1);
        //this.lightmap.setVisible(false);

        const player = this;
        this.setOnCollide((e:Types.Physics.Matter.MatterCollisionData) => {
            if(player === e.bodyA.gameObject){
                player.collideWith(e, e.bodyB.gameObject);
            } else {
                player.collideWith(e, e.bodyA.gameObject);
            }
        });
    }

    updateControls(delta: number) {
        const ndelta = delta / 16.0;
        const body = this.body as any;
        let curAngVel = body.angularVelocity;
        if ((this.cursorKeys.left.isDown || this.wasdKeys.Q.isDown)) {
            this.fuel -= ndelta * 0.4;
            curAngVel += -0.0003 * ndelta;
            this.thrusterRotateCCW.setVisible(true);
        } else {
            this.thrusterRotateCCW.setVisible(false);
        }

        if ((this.cursorKeys.right.isDown || this.wasdKeys.E.isDown)) {
            this.fuel -= ndelta * 0.4;
            curAngVel -= -0.0003 * ndelta;
            this.thrusterRotateCW.setVisible(true);
        } else {
            this.thrusterRotateCW.setVisible(false);
        }
        this.setAngularVelocity(curAngVel);

        if ((this.cursorKeys.up.isDown || this.wasdKeys.W.isDown)) {
            this.fuel -= ndelta * 0.4;
            this.thrust(0.01 * ndelta);
            this.thrusterForward.setVisible(true);
        } else {
            this.thrusterForward.setVisible(false);
        }

        if ((this.cursorKeys.down.isDown || this.wasdKeys.S.isDown)) {
            this.fuel -= ndelta * 0.4;
            this.thrustBack(0.01 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        if (this.wasdKeys.A.isDown) {
            this.fuel -= ndelta * 0.4;
            this.thrustLeft(0.01 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        if (this.wasdKeys.D.isDown) {
            this.fuel -= ndelta * 0.4;
            this.thrustRight(0.01 * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }
    }

    updateChildren() {
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

    update(time: number, delta: number) {
        const ndelta = delta / 16.0;
        this.stunned -= delta;
        this.updateChildren();
        if(this.didCollide){
            const diff = {x: this.body.velocity.x - this.collisionVelocity.x, y: this.body.velocity.y - this.collisionVelocity.y };
            const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
            if(dist > 5){
                this.isDead = true;
            } else if(dist > 3){
                this.stunned = 5000.0;
            }
            this.didCollide = false;
        }
        if((this.fuel > 0.0) && !this.isDead && (this.stunned < 0.0)){
            this.updateControls(delta);
        } else {
            this.thrusterForward.setVisible(false);
            this.thrusterBackward.setVisible(false);
            this.thrusterRotateCW.setVisible(false);
            this.thrusterRotateCCW.setVisible(false);
        }
        this.battery -= 0.004 * ndelta;

        this.oxygen -= 0.04 * ndelta;
        if(this.oxygen <= 0){
            this.isDead = true;
        }
    }
}
