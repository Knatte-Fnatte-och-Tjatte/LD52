import { Scene, Types } from 'phaser';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';

const SPRITE_COUNT = 20;

export class MainGame extends Scene {
    camera: Types.Cameras.Controls;
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
        const worldWidth = 5000;
        const worldHeight = 5000;

        const width = window.innerWidth;
        const height = window.innerHeight;
        const bg = this.add.tileSprite(0, 0, worldWidth*2, worldWidth*2, 'bg');
        this.matter.world.setBounds(-worldWidth, -worldHeight, worldWidth, worldHeight);
        this.player = new Player(this, 640, 360);

        this.cameras.main.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);
        this.cameras.main.startFollow(this.player.sprite, false, 0.1, 0.1, 0, 0);

        this.wrecks = [];
        for(let i=0;i<50;i++){
            const x = Math.random() * worldWidth;
            const y = Math.random() * worldHeight;
            this.wrecks.push(new Wreckage(this, x, y));
        }
    }

    update(time: number, delta: number) {
        this.player?.update(this, time, delta);
    }
}