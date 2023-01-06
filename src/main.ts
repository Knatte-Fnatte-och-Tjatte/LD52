import './style.css';

import { Game } from 'phaser';
import { Example } from './scenes/example';

const main = () => {
    const config = {
        type: Phaser.WEBGL,
        pixelArt: true,
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [ Example ]
    };
    const game = new Game(config);
};
setTimeout(main, 0);
