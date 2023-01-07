import { GameObjects, Scene, Types } from 'phaser';
import { Bar } from '../ui/fuelbar';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';

const SPRITE_COUNT = 20;

export class GameScene extends Scene {
    player?: Player;
    lightSources?: GameObjects.Layer;
    wrecks: Wreckage[];


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameScene';
        super(config);
        this.wrecks = [];
    }

    preload () {
        this.load.image('light' , 'assets/light.png');
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

        const bg = this.add.tileSprite(0, 0, worldWidth*2, worldWidth*2, 'bg');
        bg.setPipeline("Light2D");
        this.matter.world.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);

        this.lights.enable();
        this.player = new Player(this, 640, 360);

        this.cameras.main.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);
        this.cameras.main.startFollow(this.player.sprite, false, 0.1, 0.1, 0, 0);

        this.wrecks = [];
        for(let i=0;i<100;i++){
            const x = Math.random() * worldWidth;
            const y = Math.random() * worldHeight;
            this.wrecks.push(new Wreckage(this, x, y));
        }
    }

    update(time: number, delta: number) {
        this.player?.update(this, time, delta);
    }
}