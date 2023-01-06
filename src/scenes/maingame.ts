import { Scene } from 'phaser';
import {Player} from '../entities/player';

const SPRITE_COUNT = 20;

export class MainGame extends Scene {
    player?: Player;

    constructor (config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    preload () {
        this.load.image('bg', 'assets/background.png');
        this.load.image('player', 'assets/player.png');
    }

    create () {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const bg = this.add.tileSprite(width/2, height/2, width, height, 'bg');
        this.player = new Player(this, 640, 360)
    }
}