import { GameObjects, Physics, Scene, Types } from 'phaser';
import { Bar } from '../ui/fuelbar';
import { Player } from '../entities/player';
import { Wreckage } from '../entities/wreckage';
import { Collectable, CollectableType } from '../entities/collectable';
import { GameOverScene } from './gameover';

const SPRITE_COUNT = 20;

export type WASDKeyMap = {
    W: Phaser.Input.Keyboard.Key,
    A: Phaser.Input.Keyboard.Key,
    S: Phaser.Input.Keyboard.Key,
    D: Phaser.Input.Keyboard.Key,
    Q: Phaser.Input.Keyboard.Key,
    E: Phaser.Input.Keyboard.Key,
}

export class GameScene extends Scene {
    player?: Player;
    lightSources?: GameObjects.Layer;
    wrecks: Wreckage[];
    collectables: Collectable[];
    cursorKeys?: Types.Input.Keyboard.CursorKeys;
    wasdKeys?: WASDKeyMap;
    gameOverActive: boolean;


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameScene';
        super(config);
        this.wrecks = [];
        this.collectables = [];
        this.gameOverActive = false;
    }

    preload () {
        this.load.image('light' , 'assets/light.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('hull', 'assets/hull.png');
        this.load.image('lightmask', 'assets/lightmask.png');
        this.load.image('lightcone', 'assets/lightcone.png');

        this.load.image('fuel', 'assets/fuel.png');
        this.load.image('oxygen', 'assets/oxygen.png');
        this.load.image('battery', 'assets/battery.png');

        this.load.image('thrust_rotate_cw', 'assets/thrust_rotate_cw.png');
        this.load.image('thrust_rotate_ccw', 'assets/thrust_rotate_ccw.png');
        this.load.image('thrust_backward', 'assets/thrust_backward.png');
        this.load.image('thrust_forward', 'assets/thrust_forward.png');
        this.load.image('thrust_strafe_left', 'assets/thrust_strafe_left.png');
        this.load.image('thrust_strafe_right', 'assets/thrust_strafe_right.png');

        this.load.audio("fuel_change", "sfx/fuel_change.mp3");
        this.load.audio("oxygen_change", "sfx/oxygen_change.mp3");
        this.load.audio("battery_change", "sfx/battery_change.mp3");
    }

    create () {
        const worldWidth = 5000;
        const worldHeight = 5000;
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D,Q,E') as WASDKeyMap;
        this.gameOverActive = false;

        this.matter.world.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);

        this.lights.enable();
        this.player = new Player(this, 640, 360, this.cursorKeys, this.wasdKeys);

        this.cameras.main.setBounds(-worldWidth, -worldHeight, worldWidth*2, worldHeight*2);
        this.cameras.main.startFollow(this.player, false, 0.1, 0.1, 0, 0);

        this.wrecks = [];
        for(let i=0;i<100;i++){
            const x = Math.random() * worldWidth;
            const y = Math.random() * worldHeight;
            this.wrecks.push(new Wreckage(this, x, y));
        }

        this.collectables = [];
        const ta:CollectableType[] = ["fuel", "oxygen", "battery"];
        for(let i=0;i<100;i++){
            const x = Math.random() * worldWidth;
            const y = Math.random() * worldHeight;
            const t = ta[(Math.random() * 3)|0];
            const v = Math.random() * 1000.0;
            this.collectables.push(new Collectable(this, x, y, v, t));
        }
    }

    update(time: number, delta: number) {
        this.player?.update(time, delta);
        if(this.player?.isDead){
            if(!this.gameOverActive){
               this.scene.run("GameOverScene");
               this.gameOverActive = true;
            }
        }
    }
}