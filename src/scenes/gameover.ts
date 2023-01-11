import { Scene } from 'phaser';
import { GameScene } from './gamescene';

export class GameOverScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameOverScene';
        super(config);
    }

    preload () {
        if(!this.textures.exists('packed')){
            this.load.multiatlas('packed', 'gfx/packed.json', 'gfx');
         }
    }

    create () {
        const that = this;
        const gs = that.scene.get("GameScene") as GameScene;
        const deathCount = gs.player?.deathCount;
        const gameOverText = this.add.text(1280/2 - 96, 64, ["Game Over", "", `Death Count: ${deathCount}`], { align: 'center'});

        const tryAgainButton = this.add.image(1280/2, 720 - 128, 'packed', 'button_try_again');
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.scene.stop('GameOverScene');
            if(gs.player){
                gs.player.isDead = false;
                gs.player.fuel = 1000;
                gs.player.oxygen = 1000;
                gs.gameOverActive = false;
            }
            //that.scene.get('GameScene').scene.restart();
        });

        const startOverButton = this.add.image(1280/2, 720 - 178, 'packed', 'button_start_over');
        startOverButton.setInteractive().on("pointerdown", () => {
            that.scene.stop('GameOverScene');
            that.scene.get('GameScene').scene.restart();
        });
    }
}