import { Scene } from 'phaser';

export class GameWonScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameWonScene';
        super(config);
    }

    preload () {
        this.load.image('button_try_again', 'assets/button_try_again.png');
    }

    create () {
        this.add.text(1280/2 - 48, 64, ["Congratulations", "", "You won!"], { align: 'center'});

        const tryAgainButton = this.add.image(1280/2, 720 - 128, 'button_try_again');
        const that = this;
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.scene.stop('GameWonScene');
            that.scene.get('GameScene').scene.restart();
        })
    }
}