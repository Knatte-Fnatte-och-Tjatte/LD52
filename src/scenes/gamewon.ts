import { Scene } from 'phaser';
import { GameScene } from './gamescene';

export class GameWonScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameWonScene';
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
        this.add.text(1280/2 - 48, 64, ["Congratulations", "", "You won!","",`And only died ${deathCount} times`], { align: 'center'});

        const tryAgainButton = this.add.image(1280/2, 720 - 128, 'packed', 'button_try_again');
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.scene.stop('GameWonScene');
            that.scene.get('GameScene').scene.restart();
        })
    }
}