import './style.css';

import { Game } from 'phaser';
import { MainGame } from './scenes/maingame';

const main = () => {
    const config = {
        type: Phaser.WEBGL,
        width: 1280,
        height: 720,
        pixelArt: true,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [ MainGame ]
    };
    const game = new Game(config);
};
setTimeout(main, 0);
