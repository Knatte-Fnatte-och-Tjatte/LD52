import { GameObjects, Scene, Physics, Types, Math as PhaserMath } from "phaser";
import { WASDKeyMap } from "../scenes/gamescene";
import { Asteroid } from "./asteroid";
import { Collectable } from "./collectable";
import { Conduit } from "./conduit";
import { Wreckage } from "./wreckage";

const FUEL_CONSUMPTION = 0.3;
const TURN_RATE = 0.0003;
const ACCELERATION_RATE = 0.01;

const OXYGEN_CONSUMPTION_RATE = 0.04;

const STUN_DURATION_MS = 5000.0;
const COLLISION_STUN_THRESHOLD = 3.0;
const COLLISION_DEATH_THRESHOLD = 5.0;

const PLAYER_MASS = 100.0;
const PLAYER_BOUNCE = 0.2;

const LIGHTCONE_ALPHA = 0.35;
const START_OXYGEN = 800.0;
const START_FUEL = 700.0;

export class Player extends Physics.Matter.Sprite {
    fuel: number;
    fuelMax: number;

    oxygen: number;
    oxygenMax: number;

    lightmask: GameObjects.Sprite;
    lightcone: GameObjects.Sprite;

    stunned: number;
    isDead: boolean;
    didCollide: boolean;
    collisionVelocity: PhaserMath.Vector2 | MatterJS.Vector;

    thrusterForward: GameObjects.Sprite;
    thrusterBackward: GameObjects.Sprite;
    thrusterStrafeLeft: GameObjects.Sprite;
    thrusterStrafeRight: GameObjects.Sprite;
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
                case "fuel":
                    this.scene.sound.add('fuel_change').play();
                    break;
                case "oxygen":
                    this.scene.sound.add('oxygen_change').play();
                    break;
            }
            other.destroy();
        } else if((other instanceof Wreckage) || (other instanceof Asteroid)){
            this.didCollide = true;
            this.collisionVelocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        } else if(other instanceof Conduit){
            this.isDead = true;
            this.scene.sound.add('plasma_death').play();
        } else if(other.tile) {
            if(other?.tile?.properties?.kills){
                this.isDead = true;
                this.scene.sound.add('plasma_death').play();
            }
        }
    }

    ceilResources() {
        this.fuel = Math.min(this.fuel, this.fuelMax);
        this.oxygen = Math.min(this.oxygen, this.oxygenMax);
    }

    constructor (scene:Scene, x:number, y:number, cursorKeys: Types.Input.Keyboard.CursorKeys, wasdKeys: WASDKeyMap) {
        super(scene.matter.world, x, y, 'player');
        scene.add.existing(this);
        this.setBody({type: 'circle', radius: 36});

        this.stunned = -1.0;
        this.fuel = START_FUEL;
        this.fuelMax = 1000.0;

        this.oxygen = START_OXYGEN;
        this.oxygenMax = 1000.0;

        this.isDead = false;


        this.setScale(0.5, 0.5);
        this.setFrictionAir(0);
        this.setFrictionStatic(0.1);
        this.setBounce(PLAYER_BOUNCE);
        this.setRotation(Math.PI * 0.5);
        this.setMass(PLAYER_MASS);

        this.thrusterForward = scene.add.sprite(x,y,'thrust_forward').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterBackward = scene.add.sprite(x,y,'thrust_backward').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterStrafeLeft = scene.add.sprite(x,y,'thrust_strafe_left').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterStrafeRight = scene.add.sprite(x,y,'thrust_strafe_right').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterRotateCW = scene.add.sprite(x,y,'thrust_rotate_cw').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterRotateCCW = scene.add.sprite(x,y,'thrust_rotate_ccw').setDepth(2).setScale(0.5).setVisible(false);

        this.cursorKeys = cursorKeys;
        this.wasdKeys = wasdKeys;
        this.collisionVelocity = this.body.velocity;
        this.didCollide = false;

        this.lightmask = scene.add.sprite(x,y,'lightmask').setDepth(1);
        this.lightcone = scene.add.sprite(x,y,'lightcone').setDepth(1).setAlpha(LIGHTCONE_ALPHA, LIGHTCONE_ALPHA, LIGHTCONE_ALPHA, LIGHTCONE_ALPHA);

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
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            curAngVel -= TURN_RATE * ndelta;
            this.thrusterRotateCCW.setVisible(true);
        } else {
            this.thrusterRotateCCW.setVisible(false);
        }

        if ((this.cursorKeys.right.isDown || this.wasdKeys.E.isDown)) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            curAngVel += TURN_RATE * ndelta;
            this.thrusterRotateCW.setVisible(true);
        } else {
            this.thrusterRotateCW.setVisible(false);
        }
        this.setAngularVelocity(curAngVel);

        if ((this.cursorKeys.up.isDown || this.wasdKeys.W.isDown)) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrust(ACCELERATION_RATE * ndelta);
            this.thrusterForward.setVisible(true);
        } else {
            this.thrusterForward.setVisible(false);
        }

        if ((this.cursorKeys.down.isDown || this.wasdKeys.S.isDown)) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrustBack(ACCELERATION_RATE * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        if (this.wasdKeys.A.isDown) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrustLeft(ACCELERATION_RATE * ndelta);
            this.thrusterStrafeLeft.setVisible(true);
        } else {
            this.thrusterStrafeLeft.setVisible(false);
        }

        if (this.wasdKeys.D.isDown) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrustRight(ACCELERATION_RATE * ndelta);
            this.thrusterStrafeRight.setVisible(true);
        } else {
            this.thrusterStrafeRight.setVisible(false);
        }
    }

    updateChildren() {
        const children = [this.thrusterForward, this.thrusterBackward, this.thrusterRotateCCW, this.thrusterRotateCW, this.thrusterStrafeLeft, this.thrusterStrafeRight, this.lightmask, this.lightcone];
        for(const t of children){
            t.x = this.x;
            t.y = this.y;
            t.angle = this.angle;
        }
    }

    update(time: number, delta: number) {
        const ndelta = delta / 16.0;
        this.stunned -= delta;
        this.updateChildren();
        if(this.didCollide){
            const diff = {x: this.body.velocity.x - this.collisionVelocity.x, y: this.body.velocity.y - this.collisionVelocity.y };
            const dist = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
            if(dist > COLLISION_DEATH_THRESHOLD){
                this.isDead = true;
            } else if(dist > COLLISION_STUN_THRESHOLD){
                this.stunned = STUN_DURATION_MS;
            }
            this.didCollide = false;
        }
        if((this.fuel > 0.0) && !this.isDead && (this.stunned < 0.0)){
            this.updateControls(delta);
        } else {
            this.thrusterForward.setVisible(false);
            this.thrusterBackward.setVisible(false);
            this.thrusterStrafeLeft.setVisible(false);
            this.thrusterStrafeRight.setVisible(false);
            this.thrusterRotateCW.setVisible(false);
            this.thrusterRotateCCW.setVisible(false);
        }

        this.oxygen -= OXYGEN_CONSUMPTION_RATE * ndelta;
        if(this.oxygen <= 0){
            this.isDead = true;
        }
    }
}
