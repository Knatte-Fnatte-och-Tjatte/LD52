import './style.css';

import { Game, Types } from 'phaser';
import { GameScene } from './scenes/gamescene';
import { UIScene } from './scenes/uiscene';
import { GameOverScene } from './scenes/gameover';
import { MainMenuScene } from './scenes/mainmenu';

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
                enableSleeping: true,
                gravity: {
                    y: 0
                },
                debug: true
            }
        },
        scene: [ MainMenuScene, GameScene, UIScene, GameOverScene ]
    };
    const game = new Game(config);
};
setTimeout(main, 0);
