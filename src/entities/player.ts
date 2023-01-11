import { GameObjects, Scene, Physics, Types, Math as PhaserMath } from "phaser";
import { GameScene, WASDKeyMap } from "../scenes/gamescene";
import { Asteroid } from "./asteroid";
import { Collectable } from "./collectable";
import { Conduit } from "./conduit";
import { Floppy } from "./floppy";
import { Wreckage } from "./wreckage";

const FUEL_CONSUMPTION = 0.3;
const TURN_RATE = 0.0003;
const ACCELERATION_RATE = 0.01;

const OXYGEN_CONSUMPTION_RATE = 0.04;

const STUN_DURATION_MS = 5000.0;
const COLLISION_STUN_THRESHOLD = 4.0;
const COLLISION_DEATH_THRESHOLD = 6.0;

const PLAYER_MASS = 100.0;
const PLAYER_BOUNCE = 0.2;

const LIGHTCONE_ALPHA = 0.35;
const START_OXYGEN = 800.0;
const START_FUEL = 700.0;

export class Player extends Physics.Matter.Sprite {
    floppies = 0
    lastBlast = 0;
    hasBlaster = false;
    fuel: number;
    fuelMax = 1000;
    deathCount = 0;

    oxygen: number;
    oxygenMax = 1000;

    lightmask: GameObjects.Sprite;
    lightcone: GameObjects.Sprite;
    blasting: GameObjects.Sprite;

    stunned = -1.0;
    isDead = false;
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


    blast() {
        if(!this.hasBlaster){return;}
        if(this.isDead || this.stunned > 0.0){return;}
        if(this.scene.time.now > this.lastBlast + 1000){
            const that = this;
            this.lastBlast = this.scene.time.now;
            this.blasting.setVisible(true);
            this.blasting.play('blaster_blast_blasting').on('animationcomplete', () => {
                that.blasting.setVisible(false);
            });
            this.thrustBack(0.7);
            this.scene.sound.add('plasma_death').play();

            const ox = Math.cos(this.angle * Math.PI / 180);
            const oy = Math.sin(this.angle * Math.PI / 180);
            const px = this.x + ox*42;
            const py = this.y + oy*42;
            const gs = this.scene as GameScene;
            const tx = (px / 32)|0;
            const ty = (px / 32)|0;
            if(gs.mapLayer){
                const tile = gs.mapLayer.getTileAtWorldXY(px,py);
                if(tile?.index === 19){
                    gs.mapLayer.putTileAtWorldXY(20,px,py);
                    const physics = tile.physics as any;
                    physics?.matterBody?.destroy();
                }
            }
        }
    }

    collideWith(e:Types.Physics.Matter.MatterCollisionData, other: any) {
        if(this.isDead || this.stunned > 0.0){return;}
        if(other instanceof Collectable){
            this.ceilResources();
            switch(other.collectableType){
                case "fuel":
                    this[other.collectableType] = this[other.collectableType] + other.value;
                    this.scene.sound.add('fuel_change').play();
                    this.ceilResources();
                    break;
                case "oxygen":
                    this[other.collectableType] = this[other.collectableType] + other.value;
                    this.scene.sound.add('oxygen_change').play();
                    this.ceilResources();
                    break;
                case "blaster":
                    this.hasBlaster = true;
                    this.scene.sound.add('oxygen_change').play();
                    break;
                case "transponder":
                    this.scene.scene.run("GameWonScene");
                    const gs = this.scene as GameScene;
                    gs.gameOverActive = true;
                    break;
            }
            other.destroy();
        } else if((other instanceof Wreckage) || (other instanceof Asteroid)){
            this.didCollide = true;
            this.collisionVelocity = new Phaser.Math.Vector2(this.body.velocity.x, this.body.velocity.y);
        } else if(other instanceof Conduit){
            if(!this.isDead){
                this.deathCount++;
            }
            this.isDead = true;
            this.scene.sound.add('plasma_death').play();
        } else if(other instanceof Floppy){
            this.floppies++;
            if(String(other.message).trim() !== ''){
                this.scene.sound.add('typing').play();
                //this.scene.events.emit('readFloppy', other.message);
            }
            other.destroy();
        } else if(other?.tile) {
            if(other?.tile?.properties?.kills){
                if(!this.isDead){
                    this.deathCount++;
                }
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
        super(scene.matter.world, x, y, 'packed', 'player');
        scene.add.existing(this);
        const gs = scene as GameScene;
        this.setBody({type: 'circle', radius: 36});

        this.fuel = START_FUEL;
        this.oxygen = START_OXYGEN;

        this.setScale(0.5, 0.5);

        this.setFrictionAir(0);
        this.setFrictionStatic(0.1);
        this.setBounce(PLAYER_BOUNCE);
        this.setRotation(Math.PI * 0.5);
        this.setMass(PLAYER_MASS);

        this.thrusterForward = scene.add.sprite(x,y,'packed','thrust_forward').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterBackward = scene.add.sprite(x,y,'packed','thrust_backward').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterStrafeLeft = scene.add.sprite(x,y,'packed','thrust_strafe_left').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterStrafeRight = scene.add.sprite(x,y,'packed','thrust_strafe_right').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterRotateCW = scene.add.sprite(x,y,'packed','thrust_rotate_cw').setDepth(2).setScale(0.5).setVisible(false);
        this.thrusterRotateCCW = scene.add.sprite(x,y,'packed','thrust_rotate_ccw').setDepth(2).setScale(0.5).setVisible(false);

        this.cursorKeys = cursorKeys;
        this.wasdKeys = wasdKeys;
        this.collisionVelocity = this.body.velocity;
        this.didCollide = false;

        this.blasting = scene.add.sprite(x,y,'blaster_blast',0).setDepth(2).setVisible(false);
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
        const children = [this.thrusterForward, this.thrusterBackward, this.thrusterRotateCCW, this.thrusterRotateCW, this.thrusterStrafeLeft, this.thrusterStrafeRight, this.lightmask, this.lightcone, this.blasting];
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
            if(!this.isDead){
                this.deathCount++;
            }
            this.isDead = true;
        }

        if(this.fuel <= 0){
            if(!this.isDead){
                this.deathCount++;
            }
            this.isDead = true;
        }
    }
}
