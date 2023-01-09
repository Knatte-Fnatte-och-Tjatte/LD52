import { Scene } from 'phaser';
import { GameScene } from './gamescene';

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
            const gs = that.scene.get("GameScene") as GameScene;
            if(gs.player){
                gs.player.isDead = false;
                gs.player.fuel = 1000;
                gs.player.oxygen = 1000;
            }
            //that.scene.get('GameScene').scene.restart();
        })
    }
}