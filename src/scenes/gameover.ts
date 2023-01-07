import { Scene } from 'phaser';

export class GameOverScene extends Scene {


    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameOverScene';
        super(config);
    }

    preload () {
        this.load.image('button_try_again', 'assets/button_try_again.png');
    }

    create () {
        const gameOverText = this.add.text(1280/2 - 48, 64, ["Game Over", "", "You Died"], { align: 'center'});

        const tryAgainButton = this.add.image(1280/2, 720 - 128, 'button_try_again');
        const that = this;
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.scene.stop('GameOverScene');
            that.scene.get('GameScene').scene.restart();
        })
    }

    update(time: number, delta: number) {

    }
}