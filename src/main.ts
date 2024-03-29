import './style.css';
import './game.css';

import { Game, Types } from 'phaser';
import { GameScene } from './scenes/game/gameScene';
import { UIScene } from './scenes/ui/uiScene';
import { GameOverScene } from './scenes/menu/gameOver';
import { MainMenuScene } from './scenes/menu/mainMenu';
import { GameWonScene } from './scenes/menu/gameWon';
import { LoadingScreenScene } from './scenes/menu/loadingScreen';

const main = () => {
    const config: Types.Core.GameConfig = {
        type: Phaser.WEBGL,
        width: 1280,
        height: 720,
        parent: document.getElementById('phaser-parent') as HTMLElement,
        dom: {
            createContainer: true
        },
        input: {
            gamepad: true
        },
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
        scene: [ LoadingScreenScene , MainMenuScene, GameScene, UIScene, GameOverScene, GameWonScene ]
    };
    const game = new Game(config);
};
setTimeout(main, 0);
