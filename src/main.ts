import './style.css';

import { Game, Types } from 'phaser';
import { GameScene } from './scenes/gamescene';
import { UIScene } from './scenes/uiscene';

const main = () => {
    const config: Types.Core.GameConfig = {
        type: Phaser.WEBGL,
        width: 1280,
        height: 720,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'matter',
            matter: {
                gravity: {
                    y: 0
                },
                debug: false
            }
        },
        scene: [ GameScene, UIScene ]
    };
    const game = new Game(config);
};
setTimeout(main, 0);
