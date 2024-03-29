
import { GameObjects, Scene, Physics, Types, Math as PhaserMath } from "phaser";
import { GameScene, WASDKeyMap } from "../scenes/game/gameScene";
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
    blastSensor: GameObjects.Sprite;

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
            const body = this.blastSensor.body as MatterJS.BodyType;
            this.blasting.play('blaster_blast_blasting').on('animationcomplete', () => {
                that.blasting.setVisible(false);
                body.collisionFilter.mask = 0;
            });
            body.collisionFilter.mask = 2;
            this.thrustBack(0.7);
            this.scene.sound.add('plasma_death').play();
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
                this.scene.events.emit('readFloppy', other.message);
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

    blasterCollide(pair: any) {
        const gs = this.scene as GameScene;
        const tileBody = pair.bodyA.label === "BlasterSensor" ? pair.bodyB : pair.bodyA;
        const tile = tileBody.gameObject.tile;

        const px = tile.x * tile.width;
        const py = tile.y * tile.height;
        if(gs.mapLayer){
            const tile = gs.mapLayer.getTileAtWorldXY(px,py);
            if(tile?.index === 19){
                gs.mapLayer.putTileAtWorldXY(20,px,py);
                const physics = tile.physics as any;
                physics?.matterBody?.destroy();
            }
        }
        console.log(tile);
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

        this.thrusterForward = scene.add.sprite(x,y,'packed','thrust_forward').setDepth(2).setScale(0.5).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
        this.thrusterBackward = scene.add.sprite(x,y,'packed','thrust_backward').setDepth(2).setScale(0.5).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
        this.thrusterStrafeLeft = scene.add.sprite(x,y,'packed','thrust_strafe_left').setDepth(2).setScale(0.5).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
        this.thrusterStrafeRight = scene.add.sprite(x,y,'packed','thrust_strafe_right').setDepth(2).setScale(0.5).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
        this.thrusterRotateCW = scene.add.sprite(x,y,'packed','thrust_rotate_cw').setDepth(2).setScale(0.5).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
        this.thrusterRotateCCW = scene.add.sprite(x,y,'packed','thrust_rotate_ccw').setDepth(2).setScale(0.5).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);

        this.cursorKeys = cursorKeys;
        this.wasdKeys = wasdKeys;
        this.collisionVelocity = this.body.velocity;
        this.didCollide = false;

        this.blastSensor = gs.matter.add.sprite(x,y,'packed','void', { isSensor: true }).setScale(2.0, 0.5);
        const body = this.blastSensor.body as MatterJS.BodyType;
        console.log(body);
        body.label = "BlasterSensor";
        body.collisionFilter.group = 0;
        body.collisionFilter.category = 2;
        body.collisionFilter.mask = 0;
        body.onCollideActiveCallback = this.blasterCollide.bind(this);

        this.blasting = scene.add.sprite(x,y,'packed','blaster_blast-0').setDepth(2).setVisible(false).setBlendMode(Phaser.BlendModes.ADD);
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

        let left = (this.cursorKeys.left.isDown || this.wasdKeys.Q.isDown);
        let right = (this.cursorKeys.right.isDown || this.wasdKeys.E.isDown);
        let forward = (this.cursorKeys.up.isDown || this.wasdKeys.W.isDown);
        let backward = (this.cursorKeys.down.isDown || this.wasdKeys.S.isDown);
        let turnLeft = this.wasdKeys.A.isDown;
        let turnRight = this.wasdKeys.D.isDown;
        let blast = this.cursorKeys?.space.isDown;

        if(this.scene.input.gamepad.gamepads[0]){
            const gamepad = this.scene.input.gamepad.gamepads[0];
            if(gamepad.left){left = true;}
            if(gamepad.right){right = true;}
            if(gamepad.up){forward = true;}
            if(gamepad.down){backward = true;}
            if(gamepad.X){turnLeft = true;}
            if(gamepad.B){turnRight = true;}
            if(gamepad.A){blast = true;}
        }

        if(blast){
            this.blast();
        }

        if (left) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            curAngVel -= TURN_RATE * ndelta;
            this.thrusterRotateCCW.setVisible(true);
        } else {
            this.thrusterRotateCCW.setVisible(false);
        }

        if (right) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            curAngVel += TURN_RATE * ndelta;
            this.thrusterRotateCW.setVisible(true);
        } else {
            this.thrusterRotateCW.setVisible(false);
        }
        this.setAngularVelocity(curAngVel);

        if (forward) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrust(ACCELERATION_RATE * ndelta);
            this.thrusterForward.setVisible(true);
        } else {
            this.thrusterForward.setVisible(false);
        }

        if (backward) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrustBack(ACCELERATION_RATE * ndelta);
            this.thrusterBackward.setVisible(true);
        } else {
            this.thrusterBackward.setVisible(false);
        }

        if (turnLeft) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrustLeft(ACCELERATION_RATE * ndelta);
            this.thrusterStrafeLeft.setVisible(true);
        } else {
            this.thrusterStrafeLeft.setVisible(false);
        }

        if (turnRight) {
            this.fuel -= ndelta * FUEL_CONSUMPTION;
            this.thrustRight(ACCELERATION_RATE * ndelta);
            this.thrusterStrafeRight.setVisible(true);
        } else {
            this.thrusterStrafeRight.setVisible(false);
        }
    }

    updateSensors() {
        const ox = Math.cos(this.rotation);
        const oy = Math.sin(this.rotation);
        const r = 32;
        this.blastSensor.x = this.x + ox * r;
        this.blastSensor.y = this.y + oy * r;
        this.blastSensor.rotation = this.rotation;
    }

    updateChildren() {
        const children = [this.thrusterForward, this.thrusterBackward, this.thrusterRotateCCW, this.thrusterRotateCW, this.thrusterStrafeLeft, this.thrusterStrafeRight, this.lightmask, this.lightcone, this.blasting];
        for(const t of children){
            t.x = this.x;
            t.y = this.y;
            t.angle = this.angle;
        }
        this.updateSensors();
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
