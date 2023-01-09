import './style.css';

import { Game, Types } from 'phaser';
import { GameScene } from './scenes/gamescene';
import { UIScene } from './scenes/uiscene';
import { GameOverScene } from './scenes/gameover';
import { MainMenuScene } from './scenes/mainmenu';
import { GameWonScene } from './scenes/gamewon';

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
            }
        },
        scene: [ MainMenuScene, GameScene, UIScene, GameOverScene, GameWonScene ]
    };
    const game = new Game(config);
};
setTimeout(main, 0);
