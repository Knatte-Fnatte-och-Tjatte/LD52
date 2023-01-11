import { Physics } from "phaser";
import { GameScene } from "../scenes/game/gameScene";

const ASTEROID_MASS = 500.0;
const ASTEROID_BOUNCE = 0.2;

export class Asteroid extends Physics.Matter.Sprite {
    constructor (scene:GameScene, x:number, y:number, vx:number, vy:number) {
        let sprite = 'asteroid';
        let mass = ASTEROID_MASS;
        switch ((Math.random() * 3.0)|0){
            case 1:
                sprite = 'asteroid_tiny';
                mass *= 0.5;
                break;
            case 2:
                sprite = 'asteroid_big';
                mass *= 2.0;
                break;
        }
        super(scene.matter.world, x, y, 'packed', sprite);
        this.scene.add.existing(this);

        this.setFrictionAir(0);
        this.setBounce(ASTEROID_BOUNCE);
        this.setRotation(Math.random() * Math.PI * 2);
        this.setVelocity(vx, vy);
        this.setMass(mass);
    }
}