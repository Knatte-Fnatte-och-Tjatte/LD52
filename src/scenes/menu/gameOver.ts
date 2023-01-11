import { Scene } from 'phaser';
import { GameScene } from '../game/gameScene';

export class GameOverScene extends Scene {
    constructor (config: Phaser.Types.Scenes.SettingsConfig) {
        if(!config){config = {};}
        config.key = 'GameOverScene';
        super(config);
    }

    continueGame () {
        const gs = this.scene.get("GameScene") as GameScene;
        this.scene.stop('GameOverScene');
        if(gs.player){
            gs.player.isDead = false;
            gs.player.fuel = 1000;
            gs.player.oxygen = 1000;
            gs.gameOverActive = false;
        }
    }

    restartGame () {
        this.scene.stop('GameOverScene');
        this.scene.get('GameScene').scene.restart();
    }

    create () {
        const that = this;
        const gs = that.scene.get("GameScene") as GameScene;
        const deathCount = gs.player?.deathCount;
        const gameOverText = this.add.text(this.scale.width/2 - 96, 64, ["Game Over", "", `Death Count: ${deathCount}`], { align: 'center'});

        const tryAgainButton = this.add.image(this.scale.width/2, this.scale.height - 128, 'packed', 'button_try_again');
        tryAgainButton.setInteractive().on("pointerdown", () => {
            that.continueGame();
            //that.scene.get('GameScene').scene.restart();
        });

        const startOverButton = this.add.image(this.scale.width/2, this.scale.height - 178, 'packed', 'button_start_over');
        startOverButton.setInteractive().on("pointerdown", () => {
            that.restartGame();
        });
    }

    update(time: number, delta: number): void {
        const that = this;
        if(this.input.gamepad.gamepads[0]){
            const gamepad = this.input.gamepad.gamepads[0];
            if(gamepad.B){
                that.restartGame();
            }
            if(gamepad.A){
                that.continueGame();
            }
        }
    }
}