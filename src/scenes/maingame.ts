import { Scene } from 'phaser';
import {Player} from '../entities/player';
import { Wreckage } from '../entities/wreckage';

const SPRITE_COUNT = 20;

export class MainGame extends Scene {
    player?: Player;
    wrecks: Wreckage[];

    constructor (config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.wrecks = [];
    }

    preload () {
        this.load.image('bg', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('hull', 'assets/hull.png');

        this.load.image('thrust_rotate_cw', 'assets/thrust_rotate_cw.png');
        this.load.image('thrust_rotate_ccw', 'assets/thrust_rotate_ccw.png');
        this.load.image('thrust_backward', 'assets/thrust_backward.png');
        this.load.image('thrust_forward', 'assets/thrust_forward.png');
    }

    create () {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const bg = this.add.tileSprite(width/2, height/2, width, height, 'bg');
        this.matter.world.setBounds(0, 0, 1280, 720);
        this.player = new Player(this, 640, 360)
        this.wrecks = [];
        for(let i=0;i<5;i++){
            const x = Math.random() * 1280;
            const y = Math.random() * 720;
            this.wrecks.push(new Wreckage(this, x, y));
        }
    }

    update(time: number, delta: number) {
        this.player?.update(this, time, delta);
    }
}